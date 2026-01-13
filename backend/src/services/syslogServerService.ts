import * as dgram from 'dgram';
import * as net from 'net';
import prisma from '../config/database';
import { logger } from '../utils/logger';

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

  // Parse syslog message (RFC 3164 / RFC 5424 format)
  private parseSyslogMessage(message: string, remoteAddress: string): any {
    const rawMessage = message.trim();
    
    // Try to parse RFC 5424 format: <priority>version timestamp hostname app-name procid msgid structured-data msg
    // Or RFC 3164 format: <priority>timestamp hostname tag: message
    const priorityMatch = rawMessage.match(/^<(\d+)>(.*)$/);
    
    let priority = 13; // Default to user.notice
    let content = rawMessage;
    
    if (priorityMatch) {
      priority = parseInt(priorityMatch[1], 10);
      content = priorityMatch[2];
    }
    
    // Calculate facility and severity from priority
    const facility = Math.floor(priority / 8);
    const severityLevel = priority % 8;
    
    // Map syslog severity to our severity levels
    const severityMap: Record<number, string> = {
      0: 'critical', // Emergency
      1: 'critical', // Alert
      2: 'critical', // Critical
      3: 'high',     // Error
      4: 'medium',   // Warning
      5: 'low',      // Notice
      6: 'info',     // Informational
      7: 'info',     // Debug
    };
    
    // Map facility to category
    const facilityMap: Record<number, string> = {
      0: 'kernel',
      1: 'user',
      2: 'mail',
      3: 'daemon',
      4: 'auth',
      5: 'syslog',
      6: 'printer',
      7: 'news',
      8: 'uucp',
      9: 'cron',
      10: 'authpriv',
      11: 'ftp',
      12: 'ntp',
      13: 'audit',
      14: 'alert',
      15: 'clock',
      16: 'local0',
      17: 'local1',
      18: 'local2',
      19: 'local3',
      20: 'local4',
      21: 'local5',
      22: 'local6',
      23: 'local7',
    };
    
    return {
      timestamp: new Date().toISOString(),
      severity: severityMap[severityLevel] || 'info',
      category: facilityMap[facility] || 'unknown',
      source: remoteAddress.replace(/^::ffff:/, ''),
      message: content,
      rawLog: rawMessage,
      protocol: 'syslog',
      metadata: {
        priority,
        facility,
        severityLevel,
      },
    };
  }

  // Process and store syslog message
  private async processMessage(message: string, remoteAddress: string): Promise<void> {
    try {
      const parsed = this.parseSyslogMessage(message, remoteAddress);
      const sourceIdentifier = parsed.source;

      // Get or create channel
      let channel = await prisma.syslogChannel.findUnique({
        where: { sourceIdentifier },
      });

      if (!channel) {
        channel = await prisma.syslogChannel.create({
          data: {
            name: `Syslog: ${sourceIdentifier}`,
            sourceIdentifier,
            description: 'Auto-created from syslog server',
            enabled: true,
          },
        });
        logger.info(`Auto-created syslog channel for: ${sourceIdentifier}`);
      }

      // Create security event
      await prisma.securityEvent.create({
        data: {
          timestamp: new Date(parsed.timestamp),
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
          channelId: channel.id,
        },
      });

      // Update channel statistics
      await prisma.syslogChannel.update({
        where: { id: channel.id },
        data: {
          eventCount: { increment: 1 },
          lastEventAt: new Date(),
        },
      });

      logger.debug(`Processed syslog message from ${remoteAddress}`);
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
        
        // Process complete messages (newline-delimited)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            this.processMessage(line, remoteAddress);
          }
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
        const value = setting.value as any;
        switch (setting.key) {
          case 'syslogTcpPort':
            this.config.tcpPort = typeof value === 'number' ? value : parseInt(value, 10) || 514;
            break;
          case 'syslogUdpPort':
            this.config.udpPort = typeof value === 'number' ? value : parseInt(value, 10) || 514;
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
