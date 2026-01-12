import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface SyslogMessage {
  timestamp?: string;
  severity: string;
  category: string;
  source: string;
  destination?: string;
  message: string;
  protocol?: string;
  port?: number;
  tags?: string[];
  metadata?: any;
}

export const receiveSyslog = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: SyslogMessage = req.body;

    // Parse and validate syslog data
    const event = await prisma.securityEvent.create({
      data: {
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        severity: data.severity || 'info',
        category: data.category || 'unknown',
        source: data.source,
        destination: data.destination,
        message: data.message,
        rawLog: JSON.stringify(req.body),
        protocol: data.protocol,
        port: data.port,
        tags: data.tags || [],
        metadata: data.metadata,
      },
    });

    logger.info(`Received security event: ${event.id}`);

    // TODO: Trigger alert forwarding rules

    res.status(201).json({
      message: 'Security event received',
      eventId: event.id,
    });
  } catch (error) {
    logger.error('Failed to process syslog:', error);
    res.status(500).json({ error: 'Failed to process syslog message' });
  }
};

export const bulkReceiveSyslog = async (req: Request, res: Response): Promise<void> => {
  try {
    const events: SyslogMessage[] = req.body;

    if (!Array.isArray(events)) {
      res.status(400).json({ error: 'Expected array of events' });
      return;
    }

    const createdEvents = await prisma.securityEvent.createMany({
      data: events.map(event => ({
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        severity: event.severity || 'info',
        category: event.category || 'unknown',
        source: event.source,
        destination: event.destination,
        message: event.message,
        rawLog: JSON.stringify(event),
        protocol: event.protocol,
        port: event.port,
        tags: event.tags || [],
        metadata: event.metadata,
      })),
    });

    logger.info(`Received ${createdEvents.count} security events`);

    res.status(201).json({
      message: 'Security events received',
      count: createdEvents.count,
    });
  } catch (error) {
    logger.error('Failed to process bulk syslog:', error);
    res.status(500).json({ error: 'Failed to process syslog messages' });
  }
};
