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
    } catch {
      message.error('加载规则失败');
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
      message.success('规则删除成功');
      loadRules();
    } catch {
      message.error('规则删除失败');
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
        message.success('规则更新成功');
      } else {
        await api.post('/alert-forwarding', data);
        message.success('规则创建成功');
      }

      setModalVisible(false);
      loadRules();
    } catch {
      message.error('保存规则失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          webhook: 'Webhook',
          email: '邮件',
          syslog: 'Syslog',
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: '目标地址',
      dataIndex: 'destination',
      key: 'destination',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Switch checked={enabled} disabled size="small" />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: any, record: AlertForwardingRule) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      <Card
        title="告警转发规则"
        size="small"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="small">
            创建规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          size="small"
        />
      </Card>

      <Modal
        title={editingRule ? '编辑规则' : '创建规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
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
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="webhook">Webhook</Option>
              <Option value="email">邮件</Option>
              <Option value="syslog">Syslog</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="目标地址"
            name="destination"
            rules={[{ required: true, message: '请输入目标地址' }]}
          >
            <Input placeholder="例如：https://webhook.site/xxx 或 email@example.com" />
          </Form.Item>

          <Form.Item
            label="条件（JSON格式）"
            name="conditions"
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('请输入有效的JSON格式，例如：{"severity": ["critical", "high"]}');
                  }
                },
              },
            ]}
          >
            <TextArea rows={6} placeholder='{"severity": ["critical", "high"]}' />
          </Form.Item>

          <Form.Item
            label="启用"
            name="enabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
