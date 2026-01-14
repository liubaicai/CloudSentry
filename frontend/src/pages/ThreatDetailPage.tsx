import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, message, Select, Input, Modal, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { eventsService } from '../services/eventsService';
import { SecurityEvent } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

const severityColors: Record<string, string> = {
  critical: 'error',
  high: 'warning',
  medium: 'gold',
  low: 'success',
  info: 'default',
};

const severityLabels: Record<string, string> = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
  info: '信息',
};

const statusLabels: Record<string, string> = {
  new: '新建',
  investigating: '调查中',
  resolved: '已解决',
  false_positive: '误报',
};

const statusColors: Record<string, string> = {
  new: 'default',
  investigating: 'warning',
  resolved: 'success',
  false_positive: 'default',
};

export const ThreatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<SecurityEvent['status']>('new');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const data = await eventsService.getEventById(eventId);
      setEvent(data);
      setStatus(data.status);
      setAssignedTo(data.assignedTo || '');
    } catch {
      message.error('加载事件详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!event) return;
    try {
      await eventsService.updateEvent(event.id, {
        status,
        assignedTo: assignedTo || undefined,
      });
      message.success('事件更新成功');
      setEditMode(false);
      loadEvent(event.id);
    } catch {
      message.error('事件更新失败');
    }
  };

  const handleDelete = () => {
    if (!event) return;
    Modal.confirm({
      title: '删除事件',
      content: '确定要删除此事件吗？',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await eventsService.deleteEvent(event.id);
          message.success('事件删除成功');
          navigate('/threats');
        } catch {
          message.error('事件删除失败');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 12, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: 12 }}>
        <Card size="small">
          <p>未找到事件</p>
          <Button onClick={() => navigate('/threats')}>返回威胁列表</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      {/* Header Banner */}
      <Card
        size="small"
        style={{
          background: '#1E293B',
          border: '1px solid #334155',
          marginBottom: 16,
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <WarningOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
            </div>
            <div>
              <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 600 }}>威胁详情</Title>
              <Text style={{ color: '#94A3B8' }}>查看和管理安全事件详细信息</Text>
            </div>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/threats')}>
              返回
            </Button>
            {!editMode && (
              <>
                <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                  编辑
                </Button>
                <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
                  删除
                </Button>
              </>
            )}
            {editMode && (
              <>
                <Button type="primary" onClick={handleUpdate}>
                  保存
                </Button>
                <Button onClick={() => setEditMode(false)}>取消</Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card 
          title={<span style={{ color: '#F8FAFC' }}>事件详情</span>} 
          size="small"
          style={{ 
            border: '1px solid #334155', 
            borderRadius: 8, 
            background: '#1E293B' 
          }}
          headStyle={{ borderBottom: '1px solid #334155' }}
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="事件ID" span={2}>
              {event.id}
            </Descriptions.Item>
            <Descriptions.Item label="发生时间">
              {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(event.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="威胁级别">
              <Tag color={severityColors[event.severity]}>
                {severityLabels[event.severity] || event.severity.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="类别">{event.category}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {editMode ? (
                <Select
                  value={status}
                  style={{ width: 120 }}
                  size="small"
                  onChange={(value) => setStatus(value)}
                >
                  <Select.Option value="new">新建</Select.Option>
                  <Select.Option value="investigating">调查中</Select.Option>
                  <Select.Option value="resolved">已解决</Select.Option>
                  <Select.Option value="false_positive">误报</Select.Option>
                </Select>
              ) : (
                <Tag color={statusColors[event.status]}>{statusLabels[event.status] || event.status}</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="负责人">
              {editMode ? (
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="分配给用户"
                  size="small"
                />
              ) : (
                event.assignedTo || '未分配'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="来源">{event.source}</Descriptions.Item>
            <Descriptions.Item label="目标">
              {event.destination || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="协议">{event.protocol || '无'}</Descriptions.Item>
            <Descriptions.Item label="端口">{event.port || '无'}</Descriptions.Item>
            <Descriptions.Item label="标签" span={2}>
              {event.tags.length > 0 ? (
                event.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
              ) : (
                '无标签'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="消息" span={2}>
              {event.message}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {event.metadata && (
          <Card 
            title={<span style={{ color: '#F8FAFC' }}>元数据</span>} 
            size="small"
            style={{ 
              border: '1px solid #334155', 
              borderRadius: 8, 
              background: '#1E293B' 
            }}
            headStyle={{ borderBottom: '1px solid #334155' }}
          >
                <pre
                  style={{
                    background: '#0F172A',
                    border: '1px solid #334155',
                    padding: 12,
                    borderRadius: 4,
                    overflow: 'auto',
                    margin: 0,
                    color: '#E2E8F0',
                  }}
                >
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </Card>
        )}

        <Card 
          title={<span style={{ color: '#F8FAFC' }}>原始日志</span>} 
          size="small"
          style={{ 
            border: '1px solid #334155', 
            borderRadius: 8, 
            background: '#1E293B' 
          }}
          headStyle={{ borderBottom: '1px solid #334155' }}
        >
          <TextArea
            value={event.rawLog}
            readOnly
            autoSize={{ minRows: 4, maxRows: 12 }}
            style={{ fontFamily: 'monospace', background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0' }}
          />
        </Card>
      </Space>
    </div>
  );
};
