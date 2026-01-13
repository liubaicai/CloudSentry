import React from 'react';
import { Card, Form, Input, Button, Switch, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    message.success('设置保存成功');
    console.log('Settings:', values);
  };

  return (
    <div style={{ padding: 12 }}>
      <Card title="系统设置" extra={<SettingOutlined />} size="small">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            retentionDays: 90,
            alertsEnabled: true,
            autoArchive: true,
          }}
          style={{ maxWidth: 500 }}
        >
          <Form.Item
            label="数据保留期限（天）"
            name="retentionDays"
            rules={[{ required: true, message: '请输入保留期限' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="启用告警"
            name="alertsEnabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>

          <Form.Item
            label="自动归档旧事件"
            name="autoArchive"
            valuePropName="checked"
          >
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>

          <Form.Item
            label="Syslog服务端口"
            name="syslogPort"
          >
            <Input type="number" placeholder="514" />
          </Form.Item>

          <Form.Item
            label="邮件通知"
            name="emailNotifications"
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
