import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Select,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import fieldMappingService, {
  FieldMapping,
  CreateFieldMappingData,
} from '../services/fieldMappingService';
import channelService, { SyslogChannel } from '../services/channelService';

const { Option } = Select;
const { TextArea } = Input;

const FieldMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [channels, setChannels] = useState<SyslogChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const targetFields = [
    'severity',
    'category',
    'source',
    'destination',
    'message',
    'protocol',
    'port',
    'tags',
    'metadata',
  ];

  const transformTypes = [
    { value: 'direct', label: 'Direct Mapping', description: 'Copy value directly' },
    { value: 'regex', label: 'Regex Transform', description: 'Extract using regex pattern' },
    { value: 'lookup', label: 'Lookup Table', description: 'Map values using lookup table' },
    { value: 'script', label: 'Script', description: 'Custom transformation script (future)' },
  ];

  useEffect(() => {
    fetchMappings();
    fetchChannels();
  }, [selectedChannel]);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const response = await fieldMappingService.getFieldMappings({
        channelId: selectedChannel,
      });
      setMappings(response.mappings);
    } catch (error) {
      message.error('Failed to fetch field mappings');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await channelService.getChannels({ limit: 100 });
      setChannels(response.channels);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const handleCreate = () => {
    setEditingMapping(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (mapping: FieldMapping) => {
    setEditingMapping(mapping);
    form.setFieldsValue({
      ...mapping,
      transformConfig: mapping.transformConfig
        ? JSON.stringify(mapping.transformConfig, null, 2)
        : '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fieldMappingService.deleteFieldMapping(id);
      message.success('Field mapping deleted successfully');
      fetchMappings();
    } catch (error) {
      message.error('Failed to delete field mapping');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Parse transformConfig if it's a string
      let transformConfig = null;
      if (values.transformConfig) {
        try {
          transformConfig = JSON.parse(values.transformConfig);
        } catch (e) {
          message.error('Invalid JSON in Transform Config');
          return;
        }
      }

      const data = {
        ...values,
        transformConfig,
      };

      if (editingMapping) {
        await fieldMappingService.updateFieldMapping(editingMapping.id, data);
        message.success('Field mapping updated successfully');
      } else {
        await fieldMappingService.createFieldMapping(
          data as CreateFieldMappingData
        );
        message.success('Field mapping created successfully');
      }
      setModalVisible(false);
      fetchMappings();
    } catch (error) {
      message.error('Failed to save field mapping');
    }
  };

  const columns: ColumnsType<FieldMapping> = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: 'Channel',
      key: 'channel',
      width: 150,
      render: (_, record) =>
        record.channel ? (
          <Tag color="blue">{record.channel.name}</Tag>
        ) : (
          <Tag color="default">Global</Tag>
        ),
    },
    {
      title: 'Source Field',
      dataIndex: 'sourceField',
      key: 'sourceField',
      width: 150,
    },
    {
      title: 'Target Field',
      dataIndex: 'targetField',
      key: 'targetField',
      width: 150,
    },
    {
      title: 'Transform Type',
      dataIndex: 'transformType',
      key: 'transformType',
      width: 130,
      render: (type: string) => {
        const config = transformTypes.find((t) => t.value === type);
        return <Tag color="purple">{config?.label || type}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this mapping?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Field Mapping Configuration"
        extra={
          <Space>
            <Select
              placeholder="Filter by channel"
              allowClear
              style={{ width: 200 }}
              onChange={setSelectedChannel}
            >
              <Option value="">All Channels</Option>
              {channels.map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name}
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchMappings}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Mapping
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={mappings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingMapping ? 'Edit Field Mapping' : 'Create Field Mapping'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="channelId"
            label="Channel"
            help="Leave empty for global mapping that applies to all channels"
          >
            <Select placeholder="Select channel or leave empty for global" allowClear>
              {channels.map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name} ({channel.sourceIdentifier})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sourceField"
            label="Source Field"
            rules={[{ required: true, message: 'Please enter source field name' }]}
            help="Field name in the incoming syslog data"
          >
            <Input placeholder="e.g., log_level, src_ip, event_type" />
          </Form.Item>
          <Form.Item
            name="targetField"
            label="Target Field"
            rules={[{ required: true, message: 'Please select target field' }]}
            help="Field in SecurityEvent table where data will be stored"
          >
            <Select placeholder="Select target field">
              {targetFields.map((field) => (
                <Option key={field} value={field}>
                  {field}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="transformType"
            label="Transform Type"
            initialValue="direct"
          >
            <Select>
              {transformTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="transformConfig"
            label="Transform Config (JSON)"
            help="Configuration for transformation. For regex: {pattern, flags, replacement}. For lookup: {mappings: {key: value}}"
          >
            <TextArea
              rows={4}
              placeholder='e.g., {"pattern": "^ERROR", "flags": "i"} or {"mappings": {"1": "critical", "2": "high"}}'
            />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            initialValue={0}
            help="Higher priority mappings are applied first"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={2}
              placeholder="Optional description of this mapping"
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FieldMappingPage;
