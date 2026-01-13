import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Switch, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { configService } from '../services/configService';

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
      message.error('加载网络配置失败');
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
      title: '删除网络配置',
      content: `确定要删除 "${config.name}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await configService.network.delete(config.id);
          message.success('网络配置删除成功');
          loadConfigs();
        } catch (error) {
          message.error('网络配置删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingConfig) {
        await configService.network.update(editingConfig.id, values);
        message.success('网络配置更新成功');
      } else {
        await configService.network.create(values);
        message.success('网络配置创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存配置失败');
    }
  };

  const columns = [
    {
      title: '名称',
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
      title: '网络接口',
      dataIndex: 'interface',
      key: 'interface',
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '网关',
      dataIndex: 'gateway',
      key: 'gateway',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => enabled ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      <Card
        title="网络配置"
        size="small"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="small">
            添加配置
          </Button>
        }
      >
        <Table columns={columns} dataSource={configs} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingConfig ? '编辑网络配置' : '创建网络配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="配置名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="interface" label="网络接口">
            <Input placeholder="例如：eth0, ens33" />
          </Form.Item>
          <Form.Item name="ipAddress" label="IP地址">
            <Input placeholder="192.168.1.100" />
          </Form.Item>
          <Form.Item name="netmask" label="子网掩码">
            <Input placeholder="255.255.255.0" />
          </Form.Item>
          <Form.Item name="gateway" label="网关">
            <Input placeholder="192.168.1.1" />
          </Form.Item>
          <Form.Item name="dnsServers" label="DNS服务器">
            <Select mode="tags" placeholder="输入DNS服务器地址" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
