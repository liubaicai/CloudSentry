import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Check if the system has been initialized (any admin user exists)
 */
export const getSetupStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    res.json({
      initialized: !!adminUser,
    });
  } catch (error) {
    logger.error('Failed to check setup status:', error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
};

interface SetupData {
  admin: {
    username: string;
    email: string;
    password: string;
  };
  settings?: {
    siteName?: string;
    syslogPort?: number;
    dataRetentionDays?: number;
  };
}

/**
 * Complete the initial setup (create admin user and initial settings)
 */
export const completeSetup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if setup has already been completed
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      res.status(400).json({ error: '系统已经初始化完成' });
      return;
    }

    const { admin, settings }: SetupData = req.body;

    // Validate admin credentials
    if (!admin?.username || !admin?.email || !admin?.password) {
      res.status(400).json({ error: '管理员用户名、邮箱和密码为必填项' });
      return;
    }

    if (admin.password.length < 6) {
      res.status(400).json({ error: '密码长度至少为6位' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        username: admin.username,
        email: admin.email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    // Create initial settings if provided
    if (settings) {
      const settingsToCreate = [];

      if (settings.siteName) {
        settingsToCreate.push({
          key: 'siteName',
          value: settings.siteName,
        });
      }

      if (settings.syslogPort) {
        settingsToCreate.push({
          key: 'syslogPort',
          value: settings.syslogPort,
        });
      }

      if (settings.dataRetentionDays) {
        settingsToCreate.push({
          key: 'dataRetentionDays',
          value: settings.dataRetentionDays,
        });
      }

      // Use Promise.all for concurrent database operations
      await Promise.all(
        settingsToCreate.map((setting) =>
          prisma.systemSettings.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
          })
        )
      );
    }

    // Generate token for auto-login after setup
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    logger.info(`System setup completed. Admin user created: ${user.username}`);

    res.status(201).json({
      message: '系统初始化完成',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Failed to complete setup:', error);
    res.status(500).json({ error: '系统初始化失败' });
  }
};
