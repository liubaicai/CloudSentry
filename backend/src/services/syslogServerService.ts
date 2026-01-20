import * as dgram from 'dgram';
import * as net from 'net';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { parseSyslogMessage, ParsedSyslogMessage } from '../utils/syslogParser';

interface SyslogServerConfig {
  tcpPort: number;
  udpPort: number;
  tcpEnabled: boolean;
  udpEnabled: boolean;
}

// Default syslog server configuration
const defaultConfig: SyslogServerConfig = {
  tcpPort: 514,
  udpPort: 514,
  tcpEnabled: true,
  udpEnabled: true,
};

class SyslogServerService {
  private udpServer: dgram.Socket | null = null;
  private tcpServer: net.Server | null = null;
  private config: SyslogServerConfig = defaultConfig;
  private channelCache: Map<string, string> = new Map();
  private pendingCreations: Map<string, Promise<string>> = new Map();

  // Helper to handle concurrent channel creation
  private async getOrCreateChannel(sourceIdentifier: string): Promise<string> {
    // 1. Check memory cache
    if (this.channelCache.has(sourceIdentifier)) {
      return this.channelCache.get(sourceIdentifier)!;
    }

    // 2. Check if a creation is already in progress for this source
    if (this.pendingCreations.has(sourceIdentifier)) {
      return this.pendingCreations.get(sourceIdentifier)!;
    }

    // 3. Start new creation process
    const creationPromise = (async () => {
      try {
        // Try to find existing first to avoid upsert overhead/conflicts
        const existing = await prisma.syslogChannel.findUnique({
          where: { sourceIdentifier },
        });

        if (existing) {
          this.channelCache.set(sourceIdentifier, existing.id);
          return existing.id;
        }

        // Use upsert for atomic creation
        const channel = await prisma.syslogChannel.upsert({
          where: { sourceIdentifier },
          update: {},
          create: {
            name: `Syslog: ${sourceIdentifier}`,
            sourceIdentifier,
            description: 'Auto-created from syslog server',
            enabled: true,
          },
        });

        this.channelCache.set(sourceIdentifier, channel.id);
        return channel.id;
      } catch (error: any) {
        // Handle P2002 (Unique constraint) - should be rare with findUnique check above
        if (error.code === 'P2002') {
          const existing = await prisma.syslogChannel.findUnique({
            where: { sourceIdentifier },
          });
          if (existing) {
            this.channelCache.set(sourceIdentifier, existing.id);
            return existing.id;
          }
        }
        throw error;
      }
    })();

    // Store the promise
    this.pendingCreations.set(sourceIdentifier, creationPromise);

    try {
      return await creationPromise;
    } finally {
      // Clean up pending promise
      this.pendingCreations.delete(sourceIdentifier);
    }
  }

  // Process and store syslog message
  private async processMessage(message: string, remoteAddress: string): Promise<void> {
    try {
      const parsed = parseSyslogMessage(message, remoteAddress);
      const sourceIdentifier = parsed.source;
      
      let channelId = await this.getOrCreateChannel(sourceIdentifier);

      try {
        // Create security event with enhanced metadata from parsed message
        await prisma.securityEvent.create({
          data: {
            timestamp: parsed.timestamp,
            severity: parsed.severity,
            category: parsed.category,
            source: parsed.source,
            sourceIp: parsed.source,
            message: parsed.message,
            rawData: parsed.rawLog,
            rawLog: parsed.rawLog,
            tags: ['syslog'],
            metadata: parsed.metadata,
            sourceChannel: sourceIdentifier,
            channelId: channelId,
          },
        });
      } catch (error: any) {
        // Handle P2003 (Foreign key constraint violation) - implies stale cache
        if (error.code === 'P2003') {
          logger.warn(`Stale channel ID for ${sourceIdentifier}, invalidating cache and retrying...`);
          this.channelCache.delete(sourceIdentifier);
          channelId = await this.getOrCreateChannel(sourceIdentifier);
          
          await prisma.securityEvent.create({
            data: {
              timestamp: parsed.timestamp,
              severity: parsed.severity,
              category: parsed.category,
              source: parsed.source,
              sourceIp: parsed.source,
              message: parsed.message,
              rawData: parsed.rawLog,
              rawLog: parsed.rawLog,
              tags: ['syslog'],
              metadata: parsed.metadata,
              sourceChannel: sourceIdentifier,
              channelId: channelId,
            },
          });
        } else {
          throw error;
        }
      }

      // Update channel statistics
      await prisma.syslogChannel.update({
        where: { id: channelId },
        data: {
          eventCount: { increment: 1 },
          lastEventAt: new Date(),
        },
      });

      logger.debug(`Processed syslog message from ${remoteAddress} (format: ${parsed.metadata.originalFormat || 'unknown'})`);
    } catch (error) {
      logger.error('Failed to process syslog message:', error);
    }
  }

  // Start UDP server
  private startUdpServer(): void {
    if (!this.config.udpEnabled) {
      logger.info('Syslog UDP server is disabled');
      return;
    }

    this.udpServer = dgram.createSocket('udp4');

    this.udpServer.on('error', (err) => {
      logger.error('Syslog UDP server error:', err);
      this.udpServer?.close();
    });

    this.udpServer.on('message', (msg, rinfo) => {
      const message = msg.toString('utf8');
      this.processMessage(message, rinfo.address);
    });

    this.udpServer.on('listening', () => {
      const address = this.udpServer?.address();
      logger.info(`Syslog UDP server listening on ${address?.address}:${address?.port}`);
    });

    try {
      this.udpServer.bind(this.config.udpPort);
    } catch (error) {
      logger.error(`Failed to bind UDP port ${this.config.udpPort}:`, error);
    }
  }

  // Start TCP server
  // Start TCP server
  private startTcpServer(): void {
    if (!this.config.tcpEnabled) {
      logger.info('Syslog TCP server is disabled');
      return;
    }

    this.tcpServer = net.createServer((socket) => {
      const remoteAddress = socket.remoteAddress || 'unknown';
      let buffer = '';

      socket.on('data', (data) => {
        buffer += data.toString('utf8');
        
        // RFC 5425 specifies octet-counting framing, but many implementations use newline or null delimiters
        // Try to handle both newline-delimited and null-delimited messages
        // Also handle messages that arrive in a single chunk without delimiter
        
        // Check for newline-delimited messages (most common)
        if (buffer.includes('\n')) {
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim()) {
              this.processMessage(line.replace(/\r$/, ''), remoteAddress);
            }
          }
        }
        // Check for null-delimited messages (RFC 6587 non-transparent framing)
        else if (buffer.includes('\0')) {
          const messages = buffer.split('\0');
          buffer = messages.pop() || '';
          
          for (const msg of messages) {
            if (msg.trim()) {
              this.processMessage(msg, remoteAddress);
            }
          }
        }
        // If buffer gets too large without a delimiter, process it as a single message
        // This handles cases where syslog messages don't include delimiters
        else if (buffer.length > 8192) {
          this.processMessage(buffer, remoteAddress);
          buffer = '';
        }
      });

      socket.on('end', () => {
        // Process any remaining data
        if (buffer.trim()) {
          this.processMessage(buffer, remoteAddress);
        }
      });

      socket.on('error', (err) => {
        logger.error('Syslog TCP socket error:', err);
      });
    });

    this.tcpServer.on('error', (err) => {
      logger.error('Syslog TCP server error:', err);
    });

    try {
      this.tcpServer.listen(this.config.tcpPort, () => {
        logger.info(`Syslog TCP server listening on port ${this.config.tcpPort}`);
      });
    } catch (error) {
      logger.error(`Failed to bind TCP port ${this.config.tcpPort}:`, error);
    }
  }

  // Load configuration from database
  async loadConfig(): Promise<void> {
    try {
      const settings = await prisma.systemSettings.findMany({
        where: {
          key: {
            in: ['syslogTcpPort', 'syslogUdpPort', 'syslogTcpEnabled', 'syslogUdpEnabled'],
          },
        },
      });

      for (const setting of settings) {
        // Prisma Json type can be various types, handle accordingly
        const value = setting.value;
        switch (setting.key) {
          case 'syslogTcpPort':
            if (typeof value === 'number') {
              this.config.tcpPort = value;
            } else if (typeof value === 'string') {
              this.config.tcpPort = parseInt(value, 10) || 514;
            }
            break;
          case 'syslogUdpPort':
            if (typeof value === 'number') {
              this.config.udpPort = value;
            } else if (typeof value === 'string') {
              this.config.udpPort = parseInt(value, 10) || 514;
            }
            break;
          case 'syslogTcpEnabled':
            this.config.tcpEnabled = value === true || value === 'true';
            break;
          case 'syslogUdpEnabled':
            this.config.udpEnabled = value === true || value === 'true';
            break;
        }
      }

      logger.info('Loaded syslog server configuration:', this.config);
    } catch (error) {
      logger.warn('Failed to load syslog config, using defaults:', error);
    }
  }

  // Start the syslog server
  async start(): Promise<void> {
    await this.loadConfig();
    this.startUdpServer();
    this.startTcpServer();
  }

  // Stop the syslog server
  stop(): void {
    if (this.udpServer) {
      this.udpServer.close();
      this.udpServer = null;
      logger.info('Syslog UDP server stopped');
    }

    if (this.tcpServer) {
      this.tcpServer.close();
      this.tcpServer = null;
      logger.info('Syslog TCP server stopped');
    }
  }

  // Restart with new configuration
  async restart(): Promise<void> {
    this.stop();
    await this.start();
  }

  // Get current status
  getStatus(): { tcp: boolean; udp: boolean; config: SyslogServerConfig } {
    return {
      tcp: this.tcpServer?.listening || false,
      udp: this.udpServer !== null,
      config: this.config,
    };
  }
}

export const syslogServerService = new SyslogServerService();
