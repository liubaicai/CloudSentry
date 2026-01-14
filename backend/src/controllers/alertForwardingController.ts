import { Response } from 'express';
import { getParamAsString } from '../utils/controllerHelpers';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.alertForwardingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rules });
  } catch (error) {
    logger.error('Failed to fetch rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const createRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, enabled, conditions, destination, type } = req.body;

    if (!name || !destination || !type) {
      res.status(400).json({ error: 'Name, destination, and type are required' });
      return;
    }

    const rule = await prisma.alertForwardingRule.create({
      data: {
        name,
        description,
        enabled,
        conditions,
        destination,
        type,
      },
    });

    logger.info(`Alert forwarding rule created: ${rule.id}`);
    res.status(201).json({ message: 'Rule created', rule });
  } catch (error) {
    logger.error('Failed to create rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { name, description, enabled, conditions, destination, type } = req.body;

    const rule = await prisma.alertForwardingRule.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(enabled !== undefined && { enabled }),
        ...(conditions && { conditions }),
        ...(destination && { destination }),
        ...(type && { type }),
      },
    });

    logger.info(`Alert forwarding rule updated: ${rule.id}`);
    res.json({ message: 'Rule updated', rule });
  } catch (error) {
    logger.error('Failed to update rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    await prisma.alertForwardingRule.delete({
      where: { id },
    });

    logger.info(`Alert forwarding rule deleted: ${id}`);
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    logger.error('Failed to delete rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
