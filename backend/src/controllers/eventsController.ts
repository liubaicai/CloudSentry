import { Response } from 'express';
import { getParamAsString } from '../utils/controllerHelpers';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

type QueryMode = 'insensitive' | 'default';

interface StringFilter {
  contains: string;
  mode: QueryMode;
}

interface EventWhereInput {
  severity?: string;
  category?: string;
  status?: string;
  OR?: Array<{
    message?: StringFilter;
    source?: StringFilter;
    destination?: StringFilter;
  }>;
  timestamp?: { gte?: Date; lte?: Date };
}

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      severity,
      category,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: EventWhereInput = {};

    if (severity) where.severity = String(severity);
    if (category) where.category = String(category);
    if (status) where.status = String(status);

    if (search) {
      where.OR = [
        { message: { contains: String(search), mode: 'insensitive' } },
        { source: { contains: String(search), mode: 'insensitive' } },
        { destination: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(String(startDate));
      if (endDate) where.timestamp.lte = new Date(String(endDate));
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
      }),
      prisma.securityEvent.count({ where }),
    ]);

    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const event = await prisma.securityEvent.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({ event });
  } catch (error) {
    logger.error('Failed to fetch event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { status, assignedTo, tags } = req.body;

    const event = await prisma.securityEvent.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(tags && { tags }),
      },
    });

    logger.info(`Event updated: ${id}`);
    res.json({ message: 'Event updated', event });
  } catch (error) {
    logger.error('Failed to update event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    await prisma.securityEvent.delete({
      where: { id },
    });

    logger.info(`Event deleted: ${id}`);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    logger.error('Failed to delete event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
