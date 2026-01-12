import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.alertForwardingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const createRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, enabled, conditions, destination, type } = req.body;

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

    res.status(201).json({ message: 'Rule created', rule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

    res.json({ message: 'Rule updated', rule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.alertForwardingRule.delete({
      where: { id },
    });

    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
