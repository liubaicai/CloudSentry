import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Switch, Select, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';
import { AlertForwardingRule } from '../types';

const { TextArea } = Input;
const { Option } = Select;

export const AlertForwardingPage: React.FC = () => {
  const [rules, setRules] = useState<AlertForwardingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertForwardingRule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/alert-forwarding');
      setRules(response.data.rules);
    } catch (error) {
      message.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (rule: AlertForwardingRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      enabled: rule.enabled,
      type: rule.type,
      destination: rule.destination,
      conditions: JSON.stringify(rule.conditions, null, 2),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/alert-forwarding/${id}`);
      message.success('Rule deleted');
      loadRules();
    } catch (error) {
      message.error('Failed to delete rule');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        conditions: JSON.parse(values.conditions),
      };

      if (editingRule) {
        await api.patch(`/alert-forwarding/${editingRule.id}`, data);
        message.success('Rule updated');
      } else {
        await api.post('/alert-forwarding', data);
        message.success('Rule created');
      }

      setModalVisible(false);
      loadRules();
    } catch (error) {
      message.error('Failed to save rule');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      ellipsis: true,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Switch checked={enabled} disabled />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AlertForwardingRule) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Alert Forwarding Rules"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Rule
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingRule ? 'Edit Rule' : 'Create Rule'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            enabled: true,
            type: 'webhook',
            conditions: '{\n  "severity": ["critical", "high"]\n}',
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter rule name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="webhook">Webhook</Option>
              <Option value="email">Email</Option>
              <Option value="syslog">Syslog</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Destination"
            name="destination"
            rules={[{ required: true, message: 'Please enter destination' }]}
          >
            <Input placeholder="e.g., https://webhook.site/xxx or email@example.com" />
          </Form.Item>

          <Form.Item
            label="Conditions (JSON)"
            name="conditions"
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (e) {
                    return Promise.reject('Please enter valid JSON format, e.g., {"severity": ["critical", "high"]}');
                  }
                },
              },
            ]}
          >
            <TextArea rows={6} placeholder='{"severity": ["critical", "high"]}' />
          </Form.Item>

          <Form.Item
            label="Enabled"
            name="enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
