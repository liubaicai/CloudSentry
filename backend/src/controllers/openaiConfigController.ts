import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { openaiService } from '../services/openaiService';
import { getParamAsString } from '../utils/controllerHelpers';

// Get OpenAI configuration
export const getOpenAIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await prisma.openAIConfig.findFirst({
      where: { enabled: true },
    });

    if (!config) {
      res.status(404).json({ error: 'No OpenAI configuration found' });
      return;
    }

    // Don't expose the full API key
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '',
    };

    res.json(safeConfig);
  } catch (error) {
    logger.error('Failed to get OpenAI config:', error);
    res.status(500).json({ error: 'Failed to fetch OpenAI configuration' });
  }
};

// Get all OpenAI configurations
export const getAllOpenAIConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await prisma.openAIConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose the full API keys
    const safeConfigs = configs.map(config => ({
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '',
    }));

    res.json({ configs: safeConfigs });
  } catch (error) {
    logger.error('Failed to get OpenAI configs:', error);
    res.status(500).json({ error: 'Failed to fetch OpenAI configurations' });
  }
};

// Create OpenAI configuration
export const createOpenAIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseUrl, apiKey, model, enabled, description } = req.body;

    if (!apiKey) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }

    const config = await prisma.openAIConfig.create({
      data: {
        baseUrl: baseUrl || 'https://api.openai.com/v1',
        apiKey,
        model: model || 'gpt-3.5-turbo',
        enabled: enabled !== undefined ? enabled : true,
        description,
      },
    });

    // Reinitialize the OpenAI service if this is enabled
    if (config.enabled) {
      await openaiService.initialize();
    }

    logger.info(`OpenAI config created: ${config.id}`);

    // Don't expose the full API key
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '',
    };

    res.status(201).json(safeConfig);
  } catch (error) {
    logger.error('Failed to create OpenAI config:', error);
    res.status(500).json({ error: 'Failed to create OpenAI configuration' });
  }
};

// Update OpenAI configuration
export const updateOpenAIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { baseUrl, apiKey, model, enabled, description } = req.body;

    const existing = await prisma.openAIConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'OpenAI configuration not found' });
      return;
    }

    const config = await prisma.openAIConfig.update({
      where: { id },
      data: {
        baseUrl,
        apiKey,
        model,
        enabled,
        description,
      },
    });

    // Reinitialize the OpenAI service if this is now enabled
    if (config.enabled) {
      await openaiService.initialize();
    }

    logger.info(`OpenAI config updated: ${config.id}`);

    // Don't expose the full API key
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '',
    };

    res.json(safeConfig);
  } catch (error) {
    logger.error('Failed to update OpenAI config:', error);
    res.status(500).json({ error: 'Failed to update OpenAI configuration' });
  }
};

// Delete OpenAI configuration
export const deleteOpenAIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const config = await prisma.openAIConfig.findUnique({
      where: { id },
    });

    if (!config) {
      res.status(404).json({ error: 'OpenAI configuration not found' });
      return;
    }

    await prisma.openAIConfig.delete({
      where: { id },
    });

    logger.info(`OpenAI config deleted: ${id}`);
    res.json({ message: 'OpenAI configuration deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete OpenAI config:', error);
    res.status(500).json({ error: 'Failed to delete OpenAI configuration' });
  }
};

// Test OpenAI connection
export const testOpenAIConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const available = await openaiService.isAvailable();
    
    if (!available) {
      res.status(503).json({ 
        error: 'OpenAI service is not available',
        available: false,
      });
      return;
    }

    res.json({ 
      message: 'OpenAI service is available',
      available: true,
    });
  } catch (error) {
    logger.error('Failed to test OpenAI connection:', error);
    res.status(500).json({ error: 'Failed to test OpenAI connection' });
  }
};
