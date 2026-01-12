import React from 'react';
import { Card, Form, Input, Button, Switch, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    message.success('Settings saved successfully');
    console.log('Settings:', values);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="System Settings" extra={<SettingOutlined />}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            retentionDays: 90,
            alertsEnabled: true,
            autoArchive: true,
          }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Data Retention Period (days)"
            name="retentionDays"
            rules={[{ required: true, message: 'Please enter retention period' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Enable Alerts"
            name="alertsEnabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Auto Archive Old Events"
            name="autoArchive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Syslog Server Port"
            name="syslogPort"
          >
            <Input type="number" placeholder="514" />
          </Form.Item>

          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
