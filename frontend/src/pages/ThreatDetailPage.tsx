import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, message, Select, Input, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { eventsService } from '../services/eventsService';
import { SecurityEvent } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const severityColors: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'gold',
  low: 'blue',
  info: 'green',
};

const statusColors: Record<string, string> = {
  new: 'blue',
  investigating: 'orange',
  resolved: 'green',
  false_positive: 'gray',
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
    } catch (error) {
      message.error('Failed to load event details');
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
      message.success('Event updated successfully');
      setEditMode(false);
      loadEvent(event.id);
    } catch (error) {
      message.error('Failed to update event');
    }
  };

  const handleDelete = () => {
    if (!event) return;
    Modal.confirm({
      title: 'Delete Event',
      content: 'Are you sure you want to delete this event?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await eventsService.deleteEvent(event.id);
          message.success('Event deleted successfully');
          navigate('/threats');
        } catch (error) {
          message.error('Failed to delete event');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <p>Event not found</p>
          <Button onClick={() => navigate('/threats')}>Back to Threat List</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/threats')}>
              Back
            </Button>
            {!editMode && (
              <>
                <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                  Edit
                </Button>
                <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
            {editMode && (
              <>
                <Button type="primary" onClick={handleUpdate}>
                  Save
                </Button>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
              </>
            )}
          </Space>
        </Card>

        <Card title="Event Details">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Event ID" span={2}>
              {event.id}
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(event.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Severity">
              <Tag color={severityColors[event.severity]}>
                {event.severity.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Category">{event.category}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {editMode ? (
                <Select
                  value={status}
                  style={{ width: 150 }}
                  onChange={(value) => setStatus(value)}
                >
                  <Select.Option value="new">New</Select.Option>
                  <Select.Option value="investigating">Investigating</Select.Option>
                  <Select.Option value="resolved">Resolved</Select.Option>
                  <Select.Option value="false_positive">False Positive</Select.Option>
                </Select>
              ) : (
                <Tag color={statusColors[event.status]}>{event.status}</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {editMode ? (
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Assign to user"
                />
              ) : (
                event.assignedTo || 'Unassigned'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Source">{event.source}</Descriptions.Item>
            <Descriptions.Item label="Destination">
              {event.destination || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Protocol">{event.protocol || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Port">{event.port || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              {event.tags.length > 0 ? (
                event.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
              ) : (
                'No tags'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Message" span={2}>
              {event.message}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {event.metadata && (
          <Card title="Metadata">
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </Card>
        )}

        <Card title="Raw Log">
          <TextArea
            value={event.rawLog}
            readOnly
            autoSize={{ minRows: 5, maxRows: 15 }}
            style={{ fontFamily: 'monospace', background: '#f5f5f5' }}
          />
        </Card>
      </Space>
    </div>
  );
};
