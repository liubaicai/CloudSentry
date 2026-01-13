import { Request, Response } from 'express';
import { getParamAsString } from '../utils/controllerHelpers';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all field mappings
export const getAllFieldMappings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.query;

    const where: any = {};
    if (channelId) {
      where.channelId = String(channelId);
    }

    const mappings = await prisma.fieldMapping.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            sourceIdentifier: true,
          },
        },
      },
    });

    res.json({ mappings });
  } catch (error) {
    logger.error('Failed to get field mappings:', error);
    res.status(500).json({ error: 'Failed to fetch field mappings' });
  }
};

// Get single field mapping
export const getFieldMapping = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const mapping = await prisma.fieldMapping.findUnique({
      where: { id },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            sourceIdentifier: true,
          },
        },
      },
    });

    if (!mapping) {
      res.status(404).json({ error: 'Field mapping not found' });
      return;
    }

    res.json(mapping);
  } catch (error) {
    logger.error('Failed to get field mapping:', error);
    res.status(500).json({ error: 'Failed to fetch field mapping' });
  }
};

// Create field mapping
export const createFieldMapping = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      channelId,
      sourceField,
      targetField,
      transformType,
      transformConfig,
      enabled,
      priority,
      description,
    } = req.body;

    if (!sourceField || !targetField) {
      res.status(400).json({ error: 'sourceField and targetField are required' });
      return;
    }

    // Validate targetField is a valid SecurityEvent field
    const validTargetFields = [
      'threatName',
      'threatLevel',
      'severity',
      'category',
      'sourceIp',
      'destinationIp',
      'sourcePort',
      'destinationPort',
      'source',
      'destination',
      'message',
      'protocol',
      'port',
      'tags',
      'metadata',
    ];

    if (!validTargetFields.includes(targetField)) {
      res.status(400).json({
        error: `Invalid targetField. Must be one of: ${validTargetFields.join(', ')}`,
      });
      return;
    }

    // If channelId is provided, verify it exists
    if (channelId) {
      const channel = await prisma.syslogChannel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        res.status(404).json({ error: 'Channel not found' });
        return;
      }
    }

    const mapping = await prisma.fieldMapping.create({
      data: {
        channelId: channelId || null,
        sourceField,
        targetField,
        transformType: transformType || 'direct',
        transformConfig,
        enabled: enabled !== undefined ? enabled : true,
        priority: priority || 0,
        description,
      },
    });

    logger.info(`Field mapping created: ${mapping.id}`);
    res.status(201).json(mapping);
  } catch (error) {
    logger.error('Failed to create field mapping:', error);
    res.status(500).json({ error: 'Failed to create field mapping' });
  }
};

// Update field mapping
export const updateFieldMapping = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const {
      channelId,
      sourceField,
      targetField,
      transformType,
      transformConfig,
      enabled,
      priority,
      description,
    } = req.body;

    const existing = await prisma.fieldMapping.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Field mapping not found' });
      return;
    }

    // If targetField is being updated, validate it
    if (targetField) {
      const validTargetFields = [
        'threatName',
        'threatLevel',
        'severity',
        'category',
        'sourceIp',
        'destinationIp',
        'sourcePort',
        'destinationPort',
        'source',
        'destination',
        'message',
        'protocol',
        'port',
        'tags',
        'metadata',
      ];

      if (!validTargetFields.includes(targetField)) {
        res.status(400).json({
          error: `Invalid targetField. Must be one of: ${validTargetFields.join(', ')}`,
        });
        return;
      }
    }

    const mapping = await prisma.fieldMapping.update({
      where: { id },
      data: {
        channelId: channelId !== undefined ? channelId : undefined,
        sourceField,
        targetField,
        transformType,
        transformConfig,
        enabled,
        priority,
        description,
      },
    });

    logger.info(`Field mapping updated: ${mapping.id}`);
    res.json(mapping);
  } catch (error) {
    logger.error('Failed to update field mapping:', error);
    res.status(500).json({ error: 'Failed to update field mapping' });
  }
};

// Delete field mapping
export const deleteFieldMapping = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const mapping = await prisma.fieldMapping.findUnique({
      where: { id },
    });

    if (!mapping) {
      res.status(404).json({ error: 'Field mapping not found' });
      return;
    }

    await prisma.fieldMapping.delete({
      where: { id },
    });

    logger.info(`Field mapping deleted: ${id}`);
    res.json({ message: 'Field mapping deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete field mapping:', error);
    res.status(500).json({ error: 'Failed to delete field mapping' });
  }
};
