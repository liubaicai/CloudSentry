import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Switch, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import { configService } from '../services/configService';

export const SecurityConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, [filterCategory]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await configService.security.getAll(filterCategory || undefined);
      setConfigs(data);
    } catch (error) {
      message.error('Failed to load security configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, value: {} });
    setModalVisible(true);
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    form.setFieldsValue({
      ...config,
      value: typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : config.value,
    });
    setModalVisible(true);
  };

  const handleDelete = (config: any) => {
    Modal.confirm({
      title: 'Delete Security Configuration',
      content: `Are you sure you want to delete "${config.category}.${config.key}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await configService.security.delete(config.id);
          message.success('Security configuration deleted');
          loadConfigs();
        } catch (error) {
          message.error('Failed to delete configuration');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      // Parse JSON value
      let parsedValue = values.value;
      if (typeof values.value === 'string') {
        try {
          parsedValue = JSON.parse(values.value);
        } catch (e) {
          parsedValue = values.value;
        }
      }

      const data = { ...values, value: parsedValue };

      if (editingConfig) {
        await configService.security.update(editingConfig.id, data);
        message.success('Security configuration updated');
      } else {
        await configService.security.create(data);
        message.success('Security configuration created');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save configuration');
    }
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (value: any) => JSON.stringify(value),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => enabled ? 'Yes' : 'No',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <SafetyOutlined />
            Security Configuration
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Filter by category"
              style={{ width: 200 }}
              onChange={setFilterCategory}
              allowClear
            >
              <Select.Option value="authentication">Authentication</Select.Option>
              <Select.Option value="encryption">Encryption</Select.Option>
              <Select.Option value="access_control">Access Control</Select.Option>
              <Select.Option value="password_policy">Password Policy</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add Configuration
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={configs} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingConfig ? 'Edit Security Configuration' : 'Create Security Configuration'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Select.Option value="authentication">Authentication</Select.Option>
              <Select.Option value="encryption">Encryption</Select.Option>
              <Select.Option value="access_control">Access Control</Select.Option>
              <Select.Option value="password_policy">Password Policy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input placeholder="Configuration key" />
          </Form.Item>
          <Form.Item name="value" label="Value (JSON)" rules={[{ required: true }]}>
            <Input.TextArea
              placeholder='{"minLength": 8, "requireSpecialChar": true}'
              rows={4}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description" rows={2} />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
