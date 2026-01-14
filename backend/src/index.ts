import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { dataRetentionService } from './services/dataRetentionService';
import { syslogServerService } from './services/syslogServerService';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import syslogRoutes from './routes/syslog';
import dashboardRoutes from './routes/dashboard';
import alertForwardingRoutes from './routes/alertForwarding';
import settingsRoutes from './routes/settings';
import usersRoutes from './routes/users';
import networkRoutes from './routes/network';
import operationsRoutes from './routes/operations';
import securityConfigRoutes from './routes/securityConfig';
import dataManagementRoutes from './routes/dataManagement';
import channelsRoutes from './routes/channels';
import fieldMappingsRoutes from './routes/fieldMappings';
import openaiConfigRoutes from './routes/openaiConfig';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for express-rate-limit behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/syslog', syslogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alert-forwarding', alertForwardingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/security-config', securityConfigRoutes);
app.use('/api/data-management', dataManagementRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/field-mappings', fieldMappingsRoutes);
app.use('/api/openai-config', openaiConfigRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start automatic data retention cleanup
  dataRetentionService.startAutomaticCleanup();
  
  // Start syslog server (TCP/UDP on port 514) unless disabled
  // Set SYSLOG_SERVER_ENABLED=false when using an external syslog collector
  const syslogServerEnabled = process.env.SYSLOG_SERVER_ENABLED !== 'false';
  
  if (syslogServerEnabled) {
    syslogServerService.start().catch((error) => {
      logger.error('Failed to start syslog server:', error);
    });
  } else {
    logger.info('Built-in syslog server is disabled (external collector mode)');
  }
});

export default app;
