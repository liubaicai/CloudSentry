import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const securityController = {
  // Get all security configurations
  async getSecurityConfigs(req: AuthRequest, res: Response) {
    try {
      const { category } = req.query;
      const where: any = {};
      
      if (category) {
        where.category = category;
      }

      const configs = await prisma.securityConfig.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      res.json(configs);
    } catch (error) {
      logger.error('Error fetching security configs:', error);
      res.status(500).json({ error: 'Failed to fetch security configurations' });
    }
  },

  // Get security configuration by ID
  async getSecurityConfigById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const config = await prisma.securityConfig.findUnique({
        where: { id },
      });

      if (!config) {
        return res.status(404).json({ error: 'Security configuration not found' });
      }

      res.json(config);
    } catch (error) {
      logger.error('Error fetching security config:', error);
      res.status(500).json({ error: 'Failed to fetch security configuration' });
    }
  },

  // Create new security configuration
  async createSecurityConfig(req: AuthRequest, res: Response) {
    try {
      const { category, key, value, description, enabled } = req.body;

      if (!category || !key || value === undefined) {
        return res.status(400).json({ error: 'Category, key, and value are required' });
      }

      const config = await prisma.securityConfig.create({
        data: {
          category,
          key,
          value,
          description,
          enabled: enabled !== undefined ? enabled : true,
        },
      });

      logger.info(`Security config created: ${category}.${key}`);
      res.status(201).json(config);
    } catch (error) {
      logger.error('Error creating security config:', error);
      res.status(500).json({ error: 'Failed to create security configuration' });
    }
  },

  // Update security configuration
  async updateSecurityConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { category, key, value, description, enabled } = req.body;

      const updateData: any = {};
      if (category !== undefined) updateData.category = category;
      if (key !== undefined) updateData.key = key;
      if (value !== undefined) updateData.value = value;
      if (description !== undefined) updateData.description = description;
      if (enabled !== undefined) updateData.enabled = enabled;

      const config = await prisma.securityConfig.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Security config updated: ${config.category}.${config.key}`);
      res.json(config);
    } catch (error) {
      logger.error('Error updating security config:', error);
      res.status(500).json({ error: 'Failed to update security configuration' });
    }
  },

  // Delete security configuration
  async deleteSecurityConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.securityConfig.delete({
        where: { id },
      });

      logger.info(`Security config deleted: ${id}`);
      res.json({ message: 'Security configuration deleted successfully' });
    } catch (error) {
      logger.error('Error deleting security config:', error);
      res.status(500).json({ error: 'Failed to delete security configuration' });
    }
  },
};
