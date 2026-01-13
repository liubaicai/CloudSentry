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
  Typography,
  Row,
  Col,
  Collapse,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import fieldMappingService, {
  FieldMapping,
  CreateFieldMappingData,
} from '../services/fieldMappingService';
import channelService, { SyslogChannel, AIMappingSuggestion } from '../services/channelService';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const FieldMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [channels, setChannels] = useState<SyslogChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  // AI Generation states
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiChannel, setAiChannel] = useState<string | undefined>(undefined);
  const [aiSampleData, setAiSampleData] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIMappingSuggestion[]>([]);
  const [selectedAiSuggestions, setSelectedAiSuggestions] = useState<string[]>([]);
  const [aiApplying, setAiApplying] = useState(false);

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
    'threatName',
    'threatLevel',
    'sourceIp',
    'destinationIp',
    'sourcePort',
    'destinationPort',
  ];

  const targetFieldLabels: Record<string, string> = {
    severity: '级别',
    category: '类别',
    source: '来源',
    destination: '目标',
    message: '消息',
    protocol: '协议',
    port: '端口',
    tags: '标签',
    metadata: '元数据',
    threatName: '威胁名称',
    threatLevel: '威胁等级',
    sourceIp: '源IP',
    destinationIp: '目标IP',
    sourcePort: '源端口',
    destinationPort: '目标端口',
  };

  const transformTypes = [
    { value: 'direct', label: '直接映射', description: '直接复制值' },
    { value: 'regex', label: '正则转换', description: '使用正则表达式提取' },
    { value: 'lookup', label: '查找表', description: '使用查找表映射值' },
    { value: 'jsonPath', label: 'JSON路径', description: '从嵌套对象提取值' },
    { value: 'script', label: '脚本', description: '自定义转换脚本（即将推出）' },
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
      // Sort by priority descending
      const sortedMappings = response.mappings.sort((a: FieldMapping, b: FieldMapping) => b.priority - a.priority);
      setMappings(sortedMappings);
    } catch {
      message.error('加载字段映射失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await channelService.getChannels({ limit: 100 });
      setChannels(response.channels);
    } catch {
      console.error('Failed to fetch channels');
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
      message.success('字段映射删除成功');
      fetchMappings();
    } catch {
      message.error('字段映射删除失败');
    }
  };

  const handlePriorityChange = async (id: string, newPriority: number) => {
    try {
      await fieldMappingService.updateFieldMapping(id, { priority: newPriority });
      fetchMappings();
    } catch {
      message.error('优先级更新失败');
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
        } catch {
          message.error('转换配置的JSON格式无效');
          return;
        }
      }

      const data = {
        ...values,
        transformConfig,
      };

      if (editingMapping) {
        await fieldMappingService.updateFieldMapping(editingMapping.id, data);
        message.success('字段映射更新成功');
      } else {
        await fieldMappingService.createFieldMapping(
          data as CreateFieldMappingData
        );
        message.success('字段映射创建成功');
      }
      setModalVisible(false);
      fetchMappings();
    } catch {
      message.error('保存字段映射失败');
    }
  };

  // AI Generation handlers
  const openAiModal = () => {
    setAiSuggestions([]);
    setSelectedAiSuggestions([]);
    setAiSampleData('');
    setAiChannel(undefined);
    setAiModalVisible(true);
  };

  const handleAiGenerate = async () => {
    if (!aiChannel) {
      message.warning('请选择通道');
      return;
    }
    if (!aiSampleData.trim()) {
      message.warning('请输入示例数据');
      return;
    }

    let parsedSampleData;
    try {
      parsedSampleData = JSON.parse(aiSampleData);
    } catch {
      message.error('示例数据不是有效的JSON格式');
      return;
    }

    setAiGenerating(true);
    try {
      const result = await channelService.generateAIMappings(aiChannel, parsedSampleData);
      setAiSuggestions(result.mappings);
      setSelectedAiSuggestions(result.mappings.map((_, i) => `${i}`));
      message.success(`成功生成 ${result.mappings.length} 个字段映射建议`);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'AI生成失败，请检查OpenAI配置');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiApply = async () => {
    if (!aiChannel) return;
    if (selectedAiSuggestions.length === 0) {
      message.warning('请选择要应用的映射');
      return;
    }

    const selectedMappings = selectedAiSuggestions.map(i => aiSuggestions[parseInt(i)]);

    setAiApplying(true);
    try {
      const result = await channelService.applyAIMappings(aiChannel, selectedMappings);
      message.success(`成功应用 ${result.count} 个字段映射`);
      setAiModalVisible(false);
      fetchMappings();
    } catch (error: any) {
      message.error(error.response?.data?.error || '应用映射失败');
    } finally {
      setAiApplying(false);
    }
  };

  const columns: ColumnsType<FieldMapping> = [
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: (a, b) => b.priority - a.priority,
      render: (priority: number, record) => (
        <Space size="small">
          <InputNumber
            size="small"
            min={0}
            max={100}
            value={priority}
            onChange={(val) => val !== null && handlePriorityChange(record.id, val)}
            style={{ width: 60 }}
          />
          <Tooltip title="优先级高的映射先执行">
            <Tag color={priority >= 10 ? 'blue' : 'default'}>{priority}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '通道',
      key: 'channel',
      width: 120,
      render: (_, record) =>
        record.channel ? (
          <Tag color="blue">{record.channel.name}</Tag>
        ) : (
          <Tag color="default">全局</Tag>
        ),
    },
    {
      title: '源字段',
      dataIndex: 'sourceField',
      key: 'sourceField',
      width: 150,
      render: (field: string) => (
        <Space>
          {field.includes('.') && <BranchesOutlined style={{ color: '#722ed1' }} />}
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 2 }}>{field}</code>
        </Space>
      ),
    },
    {
      title: '目标字段',
      dataIndex: 'targetField',
      key: 'targetField',
      width: 100,
      render: (field: string) => (
        <Tag color="green">{targetFieldLabels[field] || field}</Tag>
      ),
    },
    {
      title: '转换类型',
      dataIndex: 'transformType',
      key: 'transformType',
      width: 100,
      render: (type: string) => {
        const config = transformTypes.find((t) => t.value === type);
        return <Tag color="purple">{config?.label || type}</Tag>;
      },
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
      width: 70,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除此映射吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      {/* Header Card */}
      <Card
        size="small"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BranchesOutlined style={{ fontSize: 28, color: 'white' }} />
          <div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>字段映射配置</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>配置Syslog数据字段到安全事件的映射规则，支持嵌套对象和AI自动生成</Text>
          </div>
        </div>
      </Card>

      <Card
        size="small"
        extra={
          <Space>
            <Select
              placeholder="按通道筛选"
              allowClear
              style={{ width: 150 }}
              onChange={setSelectedChannel}
              size="small"
            >
              <Option value="">所有通道</Option>
              {channels.map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name}
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchMappings} size="small">
              刷新
            </Button>
            <Button
              type="default"
              icon={<RobotOutlined />}
              onClick={openAiModal}
              size="small"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}
            >
              AI智能生成
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="small"
            >
              添加映射
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
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingMapping ? '编辑字段映射' : '创建字段映射'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="channelId"
            label="通道"
            help="留空表示全局映射，适用于所有通道"
          >
            <Select placeholder="选择通道或留空表示全局" allowClear>
              {channels.map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name} ({channel.sourceIdentifier})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceField"
                label="源字段"
                rules={[{ required: true, message: '请输入源字段名称' }]}
                help="支持嵌套路径，如：data.network.src_ip"
              >
                <Input placeholder="例如：log_level, data.src_ip, event.type" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetField"
                label="目标字段"
                rules={[{ required: true, message: '请选择目标字段' }]}
              >
                <Select placeholder="选择目标字段">
                  {targetFields.map((field) => (
                    <Option key={field} value={field}>
                      {targetFieldLabels[field] || field}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="transformType"
                label="转换类型"
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                initialValue={0}
                help="优先级高的映射先执行（0-100）"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="transformConfig"
            label="转换配置（JSON格式）"
            help={
              <Collapse ghost size="small">
                <Panel header="查看配置示例" key="1">
                  <Paragraph style={{ fontSize: 12 }}>
                    <strong>正则转换:</strong><br />
                    <code>{`{"pattern": "^ERROR", "flags": "i"}`}</code><br /><br />
                    <strong>查找表:</strong><br />
                    <code>{`{"mappings": {"1": "low", "2": "medium", "3": "high"}}`}</code><br /><br />
                    <strong>JSON路径:</strong><br />
                    <code>{`{"path": "$.data.network.source_ip"}`}</code>
                  </Paragraph>
                </Panel>
              </Collapse>
            }
          >
            <TextArea
              rows={4}
              placeholder='例如：{"pattern": "^ERROR", "flags": "i"}'
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea
              rows={2}
              placeholder="此映射的可选描述"
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#722ed1' }} />
            AI智能生成字段映射
          </Space>
        }
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={null}
        width={800}
      >
        <Alert
          type="info"
          showIcon
          icon={<ThunderboltOutlined />}
          message="使用AI自动分析通道典型数据，生成字段映射建议"
          description="选择通道后，粘贴一条典型的日志数据（JSON格式），AI将自动识别字段并生成映射建议。"
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="选择通道" required>
              <Select
                placeholder="选择要生成映射的通道"
                value={aiChannel}
                onChange={setAiChannel}
                style={{ width: '100%' }}
              >
                {channels.map((channel) => (
                  <Option key={channel.id} value={channel.id}>
                    {channel.name} ({channel.sourceIdentifier})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="示例数据（JSON格式）" required>
          <TextArea
            rows={8}
            value={aiSampleData}
            onChange={(e) => setAiSampleData(e.target.value)}
            placeholder={`粘贴一条典型的日志数据，例如：
{
  "timestamp": "2024-01-15T10:30:00Z",
  "log_level": "ERROR",
  "source_ip": "192.168.1.100",
  "dest_ip": "10.0.0.1",
  "event_type": "intrusion",
  "message": "Unauthorized access attempt",
  "data": {
    "port": 22,
    "protocol": "SSH"
  }
}`}
          />
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={handleAiGenerate}
            loading={aiGenerating}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >
            {aiGenerating ? '生成中...' : 'AI分析并生成映射'}
          </Button>
        </div>

        {aiSuggestions.length > 0 && (
          <>
            <Title level={5}>生成的映射建议</Title>
            <Table
              rowSelection={{
                selectedRowKeys: selectedAiSuggestions,
                onChange: (keys) => setSelectedAiSuggestions(keys as string[]),
              }}
              dataSource={aiSuggestions.map((s, i) => ({ ...s, key: `${i}` }))}
              columns={[
                {
                  title: '源字段',
                  dataIndex: 'sourceField',
                  render: (f: string) => <code>{f}</code>,
                },
                {
                  title: '目标字段',
                  dataIndex: 'targetField',
                  render: (f: string) => <Tag color="green">{targetFieldLabels[f] || f}</Tag>,
                },
                {
                  title: '转换类型',
                  dataIndex: 'transformType',
                  render: (t: string) => <Tag color="purple">{t}</Tag>,
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  ellipsis: true,
                },
              ]}
              pagination={false}
              size="small"
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setAiModalVisible(false)}>取消</Button>
                <Button
                  type="primary"
                  onClick={handleAiApply}
                  loading={aiApplying}
                  disabled={selectedAiSuggestions.length === 0}
                >
                  应用选中的映射 ({selectedAiSuggestions.length})
                </Button>
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default FieldMappingPage;
