import prisma from '../config/database';
import { logger } from '../utils/logger';

export class DataRetentionService {
  private retentionDays: number = 7;

  /**
   * Clean up old security events based on retention policy
   */
  async cleanupOldEvents(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      logger.info(`Cleaning up security events older than ${cutoffDate.toISOString()}`);

      const result = await prisma.securityEvent.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Deleted ${result.count} old security events`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old events:', error);
      throw error;
    }
  }

  /**
   * Get current retention policy
   */
  getRetentionDays(): number {
    return this.retentionDays;
  }

  /**
   * Set retention policy (in days)
   */
  setRetentionDays(days: number): void {
    if (days < 1) {
      throw new Error('Retention days must be at least 1');
    }
    this.retentionDays = days;
    logger.info(`Data retention policy set to ${days} days`);
  }

  /**
   * Get statistics about data storage
   */
  async getStorageStats(): Promise<any> {
    try {
      const total = await prisma.securityEvent.count();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      const withinRetention = await prisma.securityEvent.count({
        where: {
          timestamp: {
            gte: cutoffDate,
          },
        },
      });

      const toBeDeleted = total - withinRetention;

      const oldestEvent = await prisma.securityEvent.findFirst({
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      });

      const newestEvent = await prisma.securityEvent.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      return {
        totalEvents: total,
        withinRetentionPolicy: withinRetention,
        toBeDeleted: toBeDeleted,
        retentionDays: this.retentionDays,
        oldestEventDate: oldestEvent?.timestamp,
        newestEventDate: newestEvent?.timestamp,
      };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * Start automatic cleanup job (runs daily)
   */
  startAutomaticCleanup(): void {
    // Run cleanup every 24 hours
    const interval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Run immediately on start
    this.cleanupOldEvents().catch(err => {
      logger.error('Failed to run initial cleanup:', err);
    });

    // Then run every 24 hours
    setInterval(() => {
      this.cleanupOldEvents().catch(err => {
        logger.error('Failed to run scheduled cleanup:', err);
      });
    }, interval);

    logger.info('Automatic data retention cleanup started (runs every 24 hours)');
  }
}

export const dataRetentionService = new DataRetentionService();
