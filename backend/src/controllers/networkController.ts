import { Response } from 'express';
import { getParamAsString } from '../utils/controllerHelpers';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import * as os from 'os';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Helper function to get default gateway
function getDefaultGateway(): string | null {
  try {
    // Try to get the default gateway on Linux
    const result = execSync('ip route | grep default | awk \'{print $3}\'', { encoding: 'utf-8' });
    return result.trim() || null;
  } catch {
    try {
      // Fallback for macOS
      const result = execSync('netstat -nr | grep default | awk \'{print $2}\' | head -1', { encoding: 'utf-8' });
      return result.trim() || null;
    } catch {
      return null;
    }
  }
}

// Helper function to get DNS servers
function getDnsServers(): string[] {
  try {
    // Read resolv.conf on Linux/macOS
    const result = execSync('cat /etc/resolv.conf | grep nameserver | awk \'{print $2}\'', { encoding: 'utf-8' });
    return result.trim().split('\n').filter(s => s);
  } catch {
    return [];
  }
}

export interface SystemNetworkInterface {
  name: string;
  ipAddress: string;
  netmask: string;
  mac: string;
  family: string;
  internal: boolean;
  gateway: string | null;
  dnsServers: string[];
}

export const networkController = {
  // Get system network interfaces (from the OS)
  async getSystemInterfaces(req: AuthRequest, res: Response) {
    try {
      const networkInterfaces = os.networkInterfaces();
      const gateway = getDefaultGateway();
      const dnsServers = getDnsServers();
      
      const interfaces: SystemNetworkInterface[] = [];
      
      for (const [name, addresses] of Object.entries(networkInterfaces)) {
        if (addresses) {
          for (const addr of addresses) {
            // Only include IPv4 addresses for now
            if (addr.family === 'IPv4') {
              interfaces.push({
                name,
                ipAddress: addr.address,
                netmask: addr.netmask,
                mac: addr.mac,
                family: addr.family,
                internal: addr.internal,
                gateway: addr.internal ? null : gateway,
                dnsServers: addr.internal ? [] : dnsServers,
              });
            }
          }
        }
      }
      
      res.json(interfaces);
    } catch (error) {
      logger.error('Error fetching system network interfaces:', error);
      res.status(500).json({ error: 'Failed to fetch system network interfaces' });
    }
  },

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
      const id = getParamAsString(req.params.id);
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
      const id = getParamAsString(req.params.id);
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
      const id = getParamAsString(req.params.id);

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
