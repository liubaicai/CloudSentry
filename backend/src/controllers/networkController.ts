import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const networkController = {
  // Get all network configurations
  async getNetworkConfigs(req: AuthRequest, res: Response) {
    try {
      const configs = await prisma.networkConfig.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(configs);
    } catch (error) {
      logger.error('Error fetching network configs:', error);
      res.status(500).json({ error: 'Failed to fetch network configurations' });
    }
  },

  // Get network configuration by ID
  async getNetworkConfigById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const config = await prisma.networkConfig.findUnique({
        where: { id },
      });

      if (!config) {
        return res.status(404).json({ error: 'Network configuration not found' });
      }

      res.json(config);
    } catch (error) {
      logger.error('Error fetching network config:', error);
      res.status(500).json({ error: 'Failed to fetch network configuration' });
    }
  },

  // Create new network configuration
  async createNetworkConfig(req: AuthRequest, res: Response) {
    try {
      const { name, description, interface: iface, ipAddress, netmask, gateway, dnsServers, enabled } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const config = await prisma.networkConfig.create({
        data: {
          name,
          description,
          interface: iface,
          ipAddress,
          netmask,
          gateway,
          dnsServers: dnsServers || [],
          enabled: enabled !== undefined ? enabled : true,
        },
      });

      logger.info(`Network config created: ${config.name}`);
      res.status(201).json(config);
    } catch (error) {
      logger.error('Error creating network config:', error);
      res.status(500).json({ error: 'Failed to create network configuration' });
    }
  },

  // Update network configuration
  async updateNetworkConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, interface: iface, ipAddress, netmask, gateway, dnsServers, enabled } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (iface !== undefined) updateData.interface = iface;
      if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
      if (netmask !== undefined) updateData.netmask = netmask;
      if (gateway !== undefined) updateData.gateway = gateway;
      if (dnsServers !== undefined) updateData.dnsServers = dnsServers;
      if (enabled !== undefined) updateData.enabled = enabled;

      const config = await prisma.networkConfig.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Network config updated: ${config.name}`);
      res.json(config);
    } catch (error) {
      logger.error('Error updating network config:', error);
      res.status(500).json({ error: 'Failed to update network configuration' });
    }
  },

  // Delete network configuration
  async deleteNetworkConfig(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.networkConfig.delete({
        where: { id },
      });

      logger.info(`Network config deleted: ${id}`);
      res.json({ message: 'Network configuration deleted successfully' });
    } catch (error) {
      logger.error('Error deleting network config:', error);
      res.status(500).json({ error: 'Failed to delete network configuration' });
    }
  },
};
