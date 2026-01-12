import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { configService } from '../services/configService';
import dayjs from 'dayjs';

export const NetworkConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await configService.network.getAll();
      setConfigs(data);
    } catch (error) {
      message.error('Failed to load network configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true });
    setModalVisible(true);
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  const handleDelete = (config: any) => {
    Modal.confirm({
      title: 'Delete Network Configuration',
      content: `Are you sure you want to delete "${config.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await configService.network.delete(config.id);
          message.success('Network configuration deleted');
          loadConfigs();
        } catch (error) {
          message.error('Failed to delete network configuration');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingConfig) {
        await configService.network.update(editingConfig.id, values);
        message.success('Network configuration updated');
      } else {
        await configService.network.create(values);
        message.success('Network configuration created');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save configuration');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <GlobalOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Interface',
      dataIndex: 'interface',
      key: 'interface',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Gateway',
      dataIndex: 'gateway',
      key: 'gateway',
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
        title="Network Configuration"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Configuration
          </Button>
        }
      >
        <Table columns={columns} dataSource={configs} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingConfig ? 'Edit Network Configuration' : 'Create Network Configuration'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Configuration name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description" rows={2} />
          </Form.Item>
          <Form.Item name="interface" label="Network Interface">
            <Input placeholder="e.g., eth0, ens33" />
          </Form.Item>
          <Form.Item name="ipAddress" label="IP Address">
            <Input placeholder="192.168.1.100" />
          </Form.Item>
          <Form.Item name="netmask" label="Netmask">
            <Input placeholder="255.255.255.0" />
          </Form.Item>
          <Form.Item name="gateway" label="Gateway">
            <Input placeholder="192.168.1.1" />
          </Form.Item>
          <Form.Item name="dnsServers" label="DNS Servers">
            <Select mode="tags" placeholder="Enter DNS servers" />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
