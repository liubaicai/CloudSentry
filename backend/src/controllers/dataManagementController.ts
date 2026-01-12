import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const dataManagementController = {
  // Get database statistics
  async getStats(req: AuthRequest, res: Response) {
    try {
      const [
        totalEvents,
        totalUsers,
        totalAlertRules,
        totalSettings,
        oldestEvent,
        newestEvent,
      ] = await Promise.all([
        prisma.securityEvent.count(),
        prisma.user.count(),
        prisma.alertForwardingRule.count(),
        prisma.systemSettings.count(),
        prisma.securityEvent.findFirst({
          orderBy: { timestamp: 'asc' },
          select: { timestamp: true },
        }),
        prisma.securityEvent.findFirst({
          orderBy: { timestamp: 'desc' },
          select: { timestamp: true },
        }),
      ]);

      res.json({
        events: {
          total: totalEvents,
          oldestTimestamp: oldestEvent?.timestamp,
          newestTimestamp: newestEvent?.timestamp,
        },
        users: { total: totalUsers },
        alertRules: { total: totalAlertRules },
        settings: { total: totalSettings },
      });
    } catch (error) {
      logger.error('Error fetching data stats:', error);
      res.status(500).json({ error: 'Failed to fetch data statistics' });
    }
  },

  // Delete old events (data retention)
  async deleteOldEvents(req: AuthRequest, res: Response) {
    try {
      const { days } = req.body;

      if (!days || days < 1) {
        return res.status(400).json({ error: 'Valid number of days is required' });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await prisma.securityEvent.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Deleted ${result.count} events older than ${days} days`);
      res.json({ 
        message: `Successfully deleted ${result.count} events`,
        count: result.count,
        cutoffDate,
      });
    } catch (error) {
      logger.error('Error deleting old events:', error);
      res.status(500).json({ error: 'Failed to delete old events' });
    }
  },

  // Export events to JSON
  async exportEvents(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate, severity, category, limit = 10000 } = req.query;

      const where: any = {};
      
      if (startDate) {
        where.timestamp = { ...where.timestamp, gte: new Date(startDate as string) };
      }
      
      if (endDate) {
        where.timestamp = { ...where.timestamp, lte: new Date(endDate as string) };
      }
      
      if (severity) {
        where.severity = severity;
      }
      
      if (category) {
        where.category = category;
      }

      const events = await prisma.securityEvent.findMany({
        where,
        take: parseInt(limit as string),
        orderBy: { timestamp: 'desc' },
      });

      logger.info(`Exported ${events.length} events`);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=events-export-${Date.now()}.json`);
      res.json(events);
    } catch (error) {
      logger.error('Error exporting events:', error);
      res.status(500).json({ error: 'Failed to export events' });
    }
  },

  // Get event count by date range
  async getEventCountByDateRange(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const count = await prisma.securityEvent.count({
        where: {
          timestamp: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
      });

      res.json({ count, startDate, endDate });
    } catch (error) {
      logger.error('Error counting events:', error);
      res.status(500).json({ error: 'Failed to count events' });
    }
  },

  // Backup database (placeholder - would need actual backup implementation)
  async createBackup(req: AuthRequest, res: Response) {
    try {
      // This is a placeholder. In a real implementation, you would:
      // 1. Use pg_dump for PostgreSQL
      // 2. Store backups in a designated location
      // 3. Implement backup rotation
      
      logger.info('Backup requested by user: ' + req.user?.username);
      
      res.json({
        message: 'Backup functionality requires pg_dump to be configured',
        note: 'Please configure backup settings in operations configuration',
      });
    } catch (error) {
      logger.error('Error creating backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  },

  // Database maintenance
  async runMaintenance(req: AuthRequest, res: Response) {
    try {
      // Run VACUUM ANALYZE on PostgreSQL (via raw query)
      await prisma.$executeRaw`VACUUM ANALYZE`;

      logger.info('Database maintenance completed');
      res.json({ message: 'Database maintenance completed successfully' });
    } catch (error) {
      logger.error('Error running maintenance:', error);
      res.status(500).json({ error: 'Failed to run database maintenance' });
    }
  },
};
