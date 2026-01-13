import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const operationsController = {
  // Get all operations configurations
  async getOperationsConfigs(req: AuthRequest, res: Response) {
    try {
      const { category } = req.query;
      const where: any = {};
      
      if (category) {
        where.category = category;
      }

      const configs = await prisma.operationsConfig.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      res.json(configs);
    } catch (error) {
      logger.error('Error fetching operations configs:', error);
      res.status(500).json({ error: 'Failed to fetch operations configurations' });
    }
  },

  // Get operations configuration by ID
  async getOperationsConfigById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const config = await prisma.operationsConfig.findUnique({
        where: { id },
      });

      if (!config) {
        return res.status(404).json({ error: 'Operations configuration not found' });
      }

      res.json(config);
    } catch (error) {
      logger.error('Error fetching operations config:', error);
      res.status(500).json({ error: 'Failed to fetch operations configuration' });
    }
  },

  // Create new operations configuration
  async createOperationsConfig(req: AuthRequest, res: Response) {
    try {
      const { category, key, value, description, enabled } = req.body;

      if (!category || !key || value === undefined) {
        return res.status(400).json({ error: 'Category, key, and value are required' });
      }

      const config = await prisma.operationsConfig.create({
        data: {
          category,
          key,
          value,
          description,
          enabled: enabled !== undefined ? enabled : true,
        },
      });

      logger.info(`Operations config created: ${category}.${key}`);
      res.status(201).json(config);
    } catch (error) {
      logger.error('Error creating operations config:', error);
      res.status(500).json({ error: 'Failed to create operations configuration' });
    }
  },

  // Update operations configuration
  async updateOperationsConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { category, key, value, description, enabled } = req.body;

      const updateData: any = {};
      if (category !== undefined) updateData.category = category;
      if (key !== undefined) updateData.key = key;
      if (value !== undefined) updateData.value = value;
      if (description !== undefined) updateData.description = description;
      if (enabled !== undefined) updateData.enabled = enabled;

      const config = await prisma.operationsConfig.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Operations config updated: ${config.category}.${config.key}`);
      res.json(config);
    } catch (error) {
      logger.error('Error updating operations config:', error);
      res.status(500).json({ error: 'Failed to update operations configuration' });
    }
  },

  // Delete operations configuration
  async deleteOperationsConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.operationsConfig.delete({
        where: { id },
      });

      logger.info(`Operations config deleted: ${id}`);
      res.json({ message: 'Operations configuration deleted successfully' });
    } catch (error) {
      logger.error('Error deleting operations config:', error);
      res.status(500).json({ error: 'Failed to delete operations configuration' });
    }
  },
};
