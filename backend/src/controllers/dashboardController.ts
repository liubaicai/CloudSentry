import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      events24h,
      events7d,
      events30d,
      severityStats,
      categoryStats,
      statusStats,
      recentEvents,
    ] = await Promise.all([
      prisma.securityEvent.count(),
      prisma.securityEvent.count({
        where: { timestamp: { gte: last24Hours } },
      }),
      prisma.securityEvent.count({
        where: { timestamp: { gte: last7Days } },
      }),
      prisma.securityEvent.count({
        where: { timestamp: { gte: last30Days } },
      }),
      prisma.securityEvent.groupBy({
        by: ['severity'],
        _count: true,
      }),
      prisma.securityEvent.groupBy({
        by: ['category'],
        _count: true,
        orderBy: { _count: { _all: 'desc' } },
        take: 10,
      }),
      prisma.securityEvent.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.securityEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          timestamp: true,
          severity: true,
          category: true,
          source: true,
          message: true,
          status: true,
        },
      }),
    ]);

    res.json({
      overview: {
        total: totalEvents,
        last24Hours: events24h,
        last7Days: events7d,
        last30Days: events30d,
      },
      severityDistribution: severityStats.map((s: any) => ({
        severity: s.severity,
        count: s._count,
      })),
      categoryDistribution: categoryStats.map((c: any) => ({
        category: c.category,
        count: c._count,
      })),
      statusDistribution: statusStats.map((s: any) => ({
        status: s.status,
        count: s._count,
      })),
      recentEvents,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getTimeSeriesData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const events = await prisma.securityEvent.findMany({
      where: {
        timestamp: { gte: startDate },
      },
      select: {
        timestamp: true,
        severity: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by date and severity
    const timeSeriesMap = new Map<string, Record<string, number>>();

    events.forEach((event: any) => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      if (!timeSeriesMap.has(dateKey)) {
        timeSeriesMap.set(dateKey, {});
      }
      const dateData = timeSeriesMap.get(dateKey)!;
      dateData[event.severity] = (dateData[event.severity] || 0) + 1;
    });

    const timeSeries = Array.from(timeSeriesMap.entries()).map(([date, severities]) => ({
      date,
      ...severities,
    }));

    res.json({ timeSeries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
};
