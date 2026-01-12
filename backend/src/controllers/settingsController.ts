import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.systemSettings.findMany();

    const settingsMap: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({ settings: settingsMap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ message: 'Setting updated', setting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

export const deleteSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    await prisma.systemSettings.delete({
      where: { key },
    });

    res.json({ message: 'Setting deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};
