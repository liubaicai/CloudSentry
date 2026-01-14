import { Response } from 'express';
import { getParamAsString } from '../utils/controllerHelpers';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

interface SystemSetting {
  key: string;
  value: unknown;
}

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.systemSettings.findMany();

    const settingsMap: Record<string, unknown> = {};
    settings.forEach((setting: SystemSetting) => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({ settings: settingsMap });
  } catch (error) {
    logger.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;

    if (!key) {
      res.status(400).json({ error: 'Key is required' });
      return;
    }

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    logger.info(`Setting updated: ${key}`);
    res.json({ message: 'Setting updated', setting });
  } catch (error) {
    logger.error('Failed to update setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

export const deleteSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const key = getParamAsString(req.params.key);

    await prisma.systemSettings.delete({
      where: { key },
    });

    logger.info(`Setting deleted: ${key}`);
    res.json({ message: 'Setting deleted' });
  } catch (error) {
    logger.error('Failed to delete setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};
