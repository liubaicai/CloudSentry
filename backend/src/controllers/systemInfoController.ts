import { Response } from 'express';
import os from 'os';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

interface CpuInfo {
  model: string;
  speed: number;
  cores: number;
  usage: number;
}

interface MemoryInfo {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

interface SystemInfo {
  os: {
    platform: string;
    type: string;
    release: string;
    arch: string;
    hostname: string;
  };
  uptime: number;
  loadAverage: number[];
  cpu: CpuInfo;
  memory: MemoryInfo;
  network: Array<{
    name: string;
    address: string;
    mac: string;
    family: string;
  }>;
  timestamp: string;
}

function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const cpus = os.cpus();
    const startMeasure = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
      return { idle: cpu.times.idle, total };
    });

    setTimeout(() => {
      const endCpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;

      endCpus.forEach((cpu, i) => {
        const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
        const idle = cpu.times.idle;
        totalIdle += idle - startMeasure[i].idle;
        totalTick += total - startMeasure[i].total;
      });

      const usage = totalTick > 0 ? ((1 - totalIdle / totalTick) * 100) : 0;
      resolve(Math.round(usage * 100) / 100);
    }, 100);
  });
}

export const getSystemInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cpuUsage = await getCpuUsage();
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const networkInterfaces = os.networkInterfaces();
    const networkInfo: Array<{ name: string; address: string; mac: string; family: string }> = [];
    
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
      if (interfaces) {
        for (const iface of interfaces) {
          if (!iface.internal) {
            networkInfo.push({
              name,
              address: iface.address,
              mac: iface.mac,
              family: iface.family,
            });
          }
        }
      }
    }

    const systemInfo: SystemInfo = {
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      cpu: {
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        cores: cpus.length,
        usage: cpuUsage,
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 10000) / 100,
      },
      network: networkInfo,
      timestamp: new Date().toISOString(),
    };

    res.json(systemInfo);
  } catch (error) {
    logger.error('Failed to get system info:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
};
