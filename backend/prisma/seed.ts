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

  // Create sample alert forwarding rules
  const alertRules = [
    {
      name: '严重告警转发 Webhook',
      description: '将所有严重和高危安全事件转发到Webhook',
      enabled: true,
      type: 'webhook',
      destination: 'https://webhook.site/your-webhook-id',
      conditions: {
        severity: ['critical', 'high'],
      },
    },
    {
      name: '邮件通知 - 入侵检测',
      description: '当检测到入侵事件时发送邮件通知',
      enabled: true,
      type: 'email',
      destination: 'security-team@example.com',
      conditions: {
        category: ['intrusion', 'malware'],
        severity: ['critical', 'high', 'medium'],
      },
    },
    {
      name: 'Syslog转发 - 全部事件',
      description: '将所有安全事件转发到SIEM系统',
      enabled: false,
      type: 'syslog',
      destination: 'siem.example.com:514',
      conditions: {
        severity: ['critical', 'high', 'medium', 'low', 'info'],
      },
    },
    {
      name: '钉钉告警通知',
      description: '通过钉钉机器人推送高危告警',
      enabled: true,
      type: 'webhook',
      destination: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
      conditions: {
        severity: ['critical'],
      },
    },
    {
      name: '企业微信告警',
      description: '通过企业微信推送安全事件',
      enabled: false,
      type: 'webhook',
      destination: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx',
      conditions: {
        severity: ['critical', 'high'],
        category: ['intrusion'],
      },
    },
  ];

  for (const ruleData of alertRules) {
    await prisma.alertForwardingRule.upsert({
      where: {
        id: `seed-${ruleData.name.replace(/\s+/g, '-').toLowerCase()}`,
      },
      update: {},
      create: {
        ...ruleData,
      },
    });
  }

  console.log('Created sample alert forwarding rules');

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
