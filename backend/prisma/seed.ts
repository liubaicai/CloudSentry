import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@cloudsentry.local',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Created admin user:', admin);

  // Create sample security events
  const sampleEvents = [
    {
      severity: 'critical',
      category: 'intrusion',
      source: '192.168.1.100',
      sourceIp: '192.168.1.100',
      destination: '192.168.1.200',
      destinationIp: '192.168.1.200',
      message: 'Brute force attack detected on SSH service',
      rawLog: 'Failed password for invalid user admin from 192.168.1.100 port 56789 ssh2',
      rawData: 'Failed password for invalid user admin from 192.168.1.100 port 56789 ssh2',
      protocol: 'TCP',
      port: 22,
      destinationPort: 22,
      tags: ['ssh', 'brute-force', 'authentication'],
    },
    {
      severity: 'high',
      category: 'malware',
      source: '192.168.1.105',
      sourceIp: '192.168.1.105',
      message: 'Malware detected: Trojan.Generic.12345',
      rawLog: 'AV Alert: Trojan.Generic.12345 found in /tmp/suspicious.exe',
      rawData: 'AV Alert: Trojan.Generic.12345 found in /tmp/suspicious.exe',
      tags: ['malware', 'trojan'],
    },
    {
      severity: 'medium',
      category: 'policy_violation',
      source: '10.0.0.50',
      sourceIp: '10.0.0.50',
      message: 'Unauthorized access attempt to restricted resource',
      rawLog: 'HTTP 403 Forbidden - User attempted to access /admin/sensitive-data',
      rawData: 'HTTP 403 Forbidden - User attempted to access /admin/sensitive-data',
      protocol: 'HTTP',
      port: 80,
      destinationPort: 80,
      tags: ['access-control', 'policy'],
    },
    {
      severity: 'low',
      category: 'network',
      source: '172.16.0.25',
      sourceIp: '172.16.0.25',
      destination: '8.8.8.8',
      destinationIp: '8.8.8.8',
      message: 'Unusual outbound DNS query pattern',
      rawLog: 'DNS query to suspicious domain: evil-tracker.com',
      rawData: 'DNS query to suspicious domain: evil-tracker.com',
      protocol: 'UDP',
      port: 53,
      destinationPort: 53,
      tags: ['dns', 'network'],
    },
    {
      severity: 'info',
      category: 'system',
      source: 'localhost',
      sourceIp: '127.0.0.1',
      message: 'System backup completed successfully',
      rawLog: 'Backup job completed at 2024-01-12 02:00:00',
      rawData: 'Backup job completed at 2024-01-12 02:00:00',
      tags: ['backup', 'system'],
    },
  ];

  for (const event of sampleEvents) {
    await prisma.securityEvent.create({ data: event });
  }

  console.log('Created sample security events');

  // Create sample alert forwarding rule
  const rule = await prisma.alertForwardingRule.create({
    data: {
      name: 'Critical Alerts to Webhook',
      description: 'Forward all critical security events to webhook',
      enabled: true,
      type: 'webhook',
      destination: 'https://webhook.site/your-webhook-id',
      conditions: {
        severity: ['critical', 'high'],
      },
    },
  });

  console.log('Created sample alert forwarding rule:', rule);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
