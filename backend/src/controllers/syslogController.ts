import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { getClientIp, isDockerGateway } from '../utils/network';

// In-memory cache for channel IDs to reduce DB load and race conditions
const channelCache: Map<string, string> = new Map();
const pendingCreations: Map<string, Promise<string>> = new Map();

interface SyslogMessage {
  timestamp?: string;
  severity?: string;
  category?: string;
  source?: string;
  destination?: string;
  message?: string;
  protocol?: string;
  port?: number;
  tags?: string[];
  metadata?: any;
  [key: string]: any; // Allow any additional fields
}

// Helper function to get or create channel based on source identifier
async function getOrCreateChannel(sourceIdentifier: string): Promise<string> {
  try {
    // 1. Check cache first
    let channelId = channelCache.get(sourceIdentifier);
    if (channelId) {
      return channelId;
    }

    // 2. Check pending creations
    if (pendingCreations.has(sourceIdentifier)) {
      return pendingCreations.get(sourceIdentifier)!;
    }

    // 3. Start new creation process
    const creationPromise = (async () => {
      try {
        // Try to find existing first
        const existing = await prisma.syslogChannel.findUnique({
          where: { sourceIdentifier },
        });

        if (existing) {
          channelCache.set(sourceIdentifier, existing.id);
          return existing.id;
        }

        // Upsert
        const channel = await prisma.syslogChannel.upsert({
          where: { sourceIdentifier },
          update: {},
          create: {
            name: `Auto-created: ${sourceIdentifier}`,
            sourceIdentifier,
            description: 'Automatically created on first syslog receipt',
            enabled: true,
          },
        });
        channelCache.set(sourceIdentifier, channel.id);
        return channel.id;
      } catch (error: any) {
        if (error.code === 'P2002') {
          const existing = await prisma.syslogChannel.findUnique({
            where: { sourceIdentifier },
          });
          if (existing) {
            channelCache.set(sourceIdentifier, existing.id);
            return existing.id;
          }
        }
        throw error;
      }
    })();

    pendingCreations.set(sourceIdentifier, creationPromise);

    try {
      return await creationPromise;
    } finally {
      pendingCreations.delete(sourceIdentifier);
    }
  } catch (error) {
    logger.error('Failed to get/create channel:', error);
    throw error;
  }
}

// Helper function to apply field mappings to raw syslog data
async function applyFieldMappings(
  rawData: any,
  channelId: string
): Promise<Partial<SyslogMessage>> {
  try {
    // Get field mappings for this channel and global mappings (channelId = null)
    const mappings = await prisma.fieldMapping.findMany({
      where: {
        enabled: true,
        OR: [{ channelId: channelId }, { channelId: null }],
      },
      orderBy: { priority: 'desc' },
    });

    const mappedData: any = {};

    for (const mapping of mappings) {
      const sourceValue = rawData[mapping.sourceField];
      
      if (sourceValue !== undefined && sourceValue !== null) {
        let transformedValue = sourceValue;

        // Apply transformation based on type
        switch (mapping.transformType) {
          case 'direct':
            transformedValue = sourceValue;
            break;
          case 'regex':
            if (mapping.transformConfig && typeof mapping.transformConfig === 'object' && !Array.isArray(mapping.transformConfig)) {
              const config = mapping.transformConfig as any;
              if (config.pattern) {
                const regex = new RegExp(config.pattern, config.flags || '');
                const match = String(sourceValue).match(regex);
                if (match) {
                  transformedValue = config.replacement
                    ? String(sourceValue).replace(regex, config.replacement)
                    : match[0];
                }
              }
            }
            break;
          case 'lookup':
            if (mapping.transformConfig && typeof mapping.transformConfig === 'object' && !Array.isArray(mapping.transformConfig)) {
              const config = mapping.transformConfig as any;
              if (config.mappings) {
                transformedValue = config.mappings[sourceValue] || sourceValue;
              }
            }
            break;
          case 'script':
            // For script type, store in metadata for now
            // In production, this could execute safe sandboxed code
            logger.info(`Script transformation not yet implemented for field: ${mapping.sourceField}`);
            break;
        }

        mappedData[mapping.targetField] = transformedValue;
      }
    }

    return mappedData;
  } catch (error) {
    logger.error('Failed to apply field mappings:', error);
    return {};
  }
}

// Helper function to process a single syslog message
async function processSyslogMessage(
  rawData: any,
  clientIp?: string
): Promise<any> {
  // Determine source identifier
  // 1. Try to use clientIp if it's available and valid
  // 2. Fallback to payload source/host
  
  let sourceIdentifier = 'unknown';
  
  if (clientIp && clientIp !== 'unknown') {
     sourceIdentifier = clientIp;
  } else {
    sourceIdentifier = rawData.source || rawData.host || 'unknown';
  }

  // Get or create channel
  let channelId = await getOrCreateChannel(sourceIdentifier);

  // Apply field mappings
  const mappedData = await applyFieldMappings(rawData, channelId);

  // Merge with original data, giving preference to mapped data
  const finalData = {
    severity: mappedData.severity || rawData.severity || 'info',
    category: mappedData.category || rawData.category || 'unknown',
    source: mappedData.source || rawData.source || sourceIdentifier,
    destination: mappedData.destination || rawData.destination || undefined,
    message: mappedData.message || rawData.message || JSON.stringify(rawData),
    protocol: mappedData.protocol || rawData.protocol || undefined,
    port: mappedData.port || rawData.port || undefined,
    tags: mappedData.tags || rawData.tags || [],
    metadata: mappedData.metadata || rawData.metadata || rawData,
  };

  try {
    // Create security event with enhanced fields
    const event = await prisma.securityEvent.create({
      data: {
        timestamp: rawData.timestamp ? new Date(rawData.timestamp) : new Date(),
        
        // Enhanced threat fields
        threatName: mappedData.threatName || rawData.threatName || rawData.threat_name,
        threatLevel: mappedData.threatLevel || rawData.threatLevel || rawData.threat_level || finalData.severity,
        severity: finalData.severity,
        category: finalData.category,
        attackType: mappedData.attackType || rawData.attackType || rawData.attack_type,
        
        // Network information - enhanced fields
        sourceIp: mappedData.sourceIp || rawData.sourceIp || rawData.src_ip || rawData.source_ip || finalData.source,
        destinationIp: mappedData.destinationIp || rawData.destinationIp || rawData.dst_ip || rawData.destination_ip || finalData.destination,
        sourcePort: mappedData.sourcePort || rawData.sourcePort || rawData.src_port || rawData.source_port,
        destinationPort: mappedData.destinationPort || rawData.destinationPort || rawData.dst_port || rawData.destination_port || finalData.port,
        protocol: finalData.protocol,
        
        // Geographic information
        country: mappedData.country || rawData.country,
        city: mappedData.city || rawData.city,
        region: mappedData.region || rawData.region,
        isp: mappedData.isp || rawData.isp,
        
        // User and device information
        userName: mappedData.userName || rawData.userName || rawData.user_name || rawData.username,
        deviceType: mappedData.deviceType || rawData.deviceType || rawData.device_type,
        
        // Action information
        action: mappedData.action || rawData.action,
        
        // Legacy fields for backward compatibility
        source: finalData.source,
        destination: finalData.destination,
        port: finalData.port,
        
        // Content
        message: finalData.message,
        rawData: JSON.stringify(rawData),
        rawLog: JSON.stringify(rawData),
        
        // Management
        tags: finalData.tags,
        metadata: finalData.metadata,
        
        // Source tracking
        sourceChannel: rawData.sourceChannel || rawData.source_channel || sourceIdentifier,
        channelId: channelId,
      },
    });

    // Update channel statistics
    await prisma.syslogChannel.update({
      where: { id: channelId },
      data: {
        eventCount: { increment: 1 },
        lastEventAt: new Date(),
      },
    });

    return event;
  } catch (error: any) {
    if (error.code === 'P2003') {
       logger.warn(`Stale channel ID for ${sourceIdentifier}, invalidating cache and retrying...`);
       channelCache.delete(sourceIdentifier);
       channelId = await getOrCreateChannel(sourceIdentifier);
       
       const event = await prisma.securityEvent.create({
        data: {
          timestamp: rawData.timestamp ? new Date(rawData.timestamp) : new Date(),
          
          // Enhanced threat fields
          threatName: mappedData.threatName || rawData.threatName || rawData.threat_name,
          threatLevel: mappedData.threatLevel || rawData.threatLevel || rawData.threat_level || finalData.severity,
          severity: finalData.severity,
          category: finalData.category,
          attackType: mappedData.attackType || rawData.attackType || rawData.attack_type,
          
          // Network information - enhanced fields
          sourceIp: mappedData.sourceIp || rawData.sourceIp || rawData.src_ip || rawData.source_ip || finalData.source,
          destinationIp: mappedData.destinationIp || rawData.destinationIp || rawData.dst_ip || rawData.destination_ip || finalData.destination,
          sourcePort: mappedData.sourcePort || rawData.sourcePort || rawData.src_port || rawData.source_port,
          destinationPort: mappedData.destinationPort || rawData.destinationPort || rawData.dst_port || rawData.destination_port || finalData.port,
          protocol: finalData.protocol,
          
          // Geographic information
          country: mappedData.country || rawData.country,
          city: mappedData.city || rawData.city,
          region: mappedData.region || rawData.region,
          isp: mappedData.isp || rawData.isp,
          
          // User and device information
          userName: mappedData.userName || rawData.userName || rawData.user_name || rawData.username,
          deviceType: mappedData.deviceType || rawData.deviceType || rawData.device_type,
          
          // Action information
          action: mappedData.action || rawData.action,
          
          // Legacy fields for backward compatibility
          source: finalData.source,
          destination: finalData.destination,
          port: finalData.port,
          
          // Content
          message: finalData.message,
          rawData: JSON.stringify(rawData),
          rawLog: JSON.stringify(rawData),
          
          // Management
          tags: finalData.tags,
          metadata: finalData.metadata,
          
          // Source tracking
          sourceChannel: rawData.sourceChannel || rawData.source_channel || sourceIdentifier,
          channelId: channelId,
        },
       });
       
       await prisma.syslogChannel.update({
         where: { id: channelId },
         data: {
           eventCount: { increment: 1 },
           lastEventAt: new Date(),
         },
       });
       
       return event;
    }
    throw error;
  }
}

export const receiveSyslog = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawData = req.body;
    const clientIp = getClientIp(req);

    const event = await processSyslogMessage(rawData, clientIp);

    logger.info(`Received security event: ${event.id} from channel: ${event.channelId}`);

    // Note: Alert forwarding triggers would be processed here
    // This would check active forwarding rules and send events to configured destinations

    res.status(201).json({
      message: 'Security event received',
      eventId: event.id,
      channelId: event.channelId,
    });
  } catch (error) {
    logger.error('Failed to process syslog:', error);
    res.status(500).json({ error: 'Failed to process syslog message' });
  }
};

export const bulkReceiveSyslog = async (req: Request, res: Response): Promise<void> => {
  try {
    const events: any[] = req.body;

    if (!Array.isArray(events)) {
      res.status(400).json({ error: 'Expected array of events' });
      return;
    }

    const clientIp = getClientIp(req);
    const createdEvents = [];

    for (const rawData of events) {
      try {
        const event = await processSyslogMessage(rawData, clientIp);
        createdEvents.push(event);
      } catch (error) {
        logger.error('Failed to process event in bulk:', error);
        // Continue processing other events
      }
    }

    logger.info(`Received ${createdEvents.length} security events`);

    res.status(201).json({
      message: 'Security events received',
      count: createdEvents.length,
      successful: createdEvents.length,
      failed: events.length - createdEvents.length,
    });
  } catch (error) {
    logger.error('Failed to process bulk syslog:', error);
    res.status(500).json({ error: 'Failed to process syslog messages' });
  }
};
