import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Switch, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { configService } from '../services/configService';

const categoryLabels: Record<string, string> = {
  retention: '数据保留',
  backup: '备份',
  maintenance: '维护',
  performance: '性能',
};

export const OperationsConfigPage: React.FC = () => {
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
      const data = await configService.operations.getAll(filterCategory || undefined);
      setConfigs(data);
    } catch (error) {
      message.error('加载运维配置失败');
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
      title: '删除运维配置',
      content: `确定要删除 "${config.category}.${config.key}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await configService.operations.delete(config.id);
          message.success('运维配置删除成功');
          loadConfigs();
        } catch (error) {
          message.error('配置删除失败');
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
        await configService.operations.update(editingConfig.id, data);
        message.success('运维配置更新成功');
      } else {
        await configService.operations.create(data);
        message.success('运维配置创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存配置失败');
    }
  };

  const columns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => categoryLabels[category] || category,
    },
    {
      title: '键名',
      dataIndex: 'key',
      key: 'key',
      width: 150,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (value: any) => JSON.stringify(value),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 60,
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
        title={
          <Space>
            <SettingOutlined />
            运维配置
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Select
              placeholder="按分类筛选"
              style={{ width: 120 }}
              onChange={setFilterCategory}
              allowClear
              size="small"
            >
              <Select.Option value="retention">数据保留</Select.Option>
              <Select.Option value="backup">备份</Select.Option>
              <Select.Option value="maintenance">维护</Select.Option>
              <Select.Option value="performance">性能</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="small">
              添加配置
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={configs} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingConfig ? '编辑运维配置' : '创建运维配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              <Select.Option value="retention">数据保留</Select.Option>
              <Select.Option value="backup">备份</Select.Option>
              <Select.Option value="maintenance">维护</Select.Option>
              <Select.Option value="performance">性能</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="key" label="键名" rules={[{ required: true, message: '请输入键名' }]}>
            <Input placeholder="配置键名" />
          </Form.Item>
          <Form.Item name="value" label="值（JSON格式）" rules={[{ required: true, message: '请输入值' }]}>
            <Input.TextArea
              placeholder='{"days": 30, "enabled": true}'
              rows={4}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
