import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all channels
export const getAllChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sourceIdentifier: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [channels, total] = await Promise.all([
      prisma.syslogChannel.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { securityEvents: true, fieldMappings: true },
          },
        },
      }),
      prisma.syslogChannel.count({ where }),
    ]);

    res.json({
      channels,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Failed to get channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

// Get single channel
export const getChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const channel = await prisma.syslogChannel.findUnique({
      where: { id },
      include: {
        fieldMappings: {
          orderBy: { priority: 'desc' },
        },
        _count: {
          select: { securityEvents: true },
        },
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    res.json(channel);
  } catch (error) {
    logger.error('Failed to get channel:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
};

// Create channel
export const createChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sourceIdentifier, description, enabled, metadata } = req.body;

    if (!name || !sourceIdentifier) {
      res.status(400).json({ error: 'Name and sourceIdentifier are required' });
      return;
    }

    // Check if sourceIdentifier already exists
    const existing = await prisma.syslogChannel.findUnique({
      where: { sourceIdentifier },
    });

    if (existing) {
      res.status(400).json({ error: 'Channel with this source identifier already exists' });
      return;
    }

    const channel = await prisma.syslogChannel.create({
      data: {
        name,
        sourceIdentifier,
        description,
        enabled: enabled !== undefined ? enabled : true,
        metadata,
      },
    });

    logger.info(`Channel created: ${channel.id}`);
    res.status(201).json(channel);
  } catch (error) {
    logger.error('Failed to create channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

// Update channel
export const updateChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, sourceIdentifier, description, enabled, metadata } = req.body;

    // Check if channel exists
    const existing = await prisma.syslogChannel.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // If updating sourceIdentifier, check for duplicates
    if (sourceIdentifier && sourceIdentifier !== existing.sourceIdentifier) {
      const duplicate = await prisma.syslogChannel.findUnique({
        where: { sourceIdentifier },
      });

      if (duplicate) {
        res.status(400).json({ error: 'Channel with this source identifier already exists' });
        return;
      }
    }

    const channel = await prisma.syslogChannel.update({
      where: { id },
      data: {
        name,
        sourceIdentifier,
        description,
        enabled,
        metadata,
      },
    });

    logger.info(`Channel updated: ${channel.id}`);
    res.json(channel);
  } catch (error) {
    logger.error('Failed to update channel:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
};

// Delete channel
export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const channel = await prisma.syslogChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    await prisma.syslogChannel.delete({
      where: { id },
    });

    logger.info(`Channel deleted: ${id}`);
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete channel:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
};

// Get channel statistics
export const getChannelStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await prisma.syslogChannel.aggregate({
      _count: true,
      _sum: {
        eventCount: true,
      },
    });

    const activeChannels = await prisma.syslogChannel.count({
      where: { enabled: true },
    });

    res.json({
      totalChannels: stats._count,
      activeChannels,
      totalEvents: stats._sum.eventCount || 0,
    });
  } catch (error) {
    logger.error('Failed to get channel stats:', error);
    res.status(500).json({ error: 'Failed to fetch channel statistics' });
  }
};
