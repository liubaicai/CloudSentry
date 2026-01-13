import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Modal, Form, InputNumber, message, DatePicker } from 'antd';
import {
  DatabaseOutlined,
  DeleteOutlined,
  ExportOutlined,
  BackupOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { configService } from '../services/configService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const DataManagementPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [exportForm] = Form.useForm();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await configService.dataManagement.getStats();
      setStats(data);
    } catch (error) {
      message.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldEvents = async (values: any) => {
    try {
      const result = await configService.dataManagement.deleteOldEvents(values.days);
      message.success(`Deleted ${result.count} events`);
      setDeleteModalVisible(false);
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete events');
    }
  };

  const handleExportEvents = async (values: any) => {
    try {
      const params: any = {};
      if (values.dateRange) {
        params.startDate = values.dateRange[0].toISOString();
        params.endDate = values.dateRange[1].toISOString();
      }
      if (values.severity) params.severity = values.severity;
      if (values.limit) params.limit = values.limit;

      const data = await configService.dataManagement.exportEvents(params);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success('Events exported successfully');
      setExportModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to export events');
    }
  };

  const handleBackup = async () => {
    Modal.confirm({
      title: 'Create Backup',
      content: 'Are you sure you want to create a database backup?',
      onOk: async () => {
        try {
          const result = await configService.dataManagement.createBackup();
          message.info(result.message);
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to create backup');
        }
      },
    });
  };

  const handleMaintenance = async () => {
    Modal.confirm({
      title: 'Run Database Maintenance',
      content: 'This will optimize the database. Continue?',
      onOk: async () => {
        try {
          await configService.dataManagement.runMaintenance();
          message.success('Database maintenance completed');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to run maintenance');
        }
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title={<><DatabaseOutlined /> Database Statistics</>} loading={loading}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Total Events" value={stats?.events.total} />
            </Col>
            <Col span={6}>
              <Statistic title="Total Users" value={stats?.users.total} />
            </Col>
            <Col span={6}>
              <Statistic title="Alert Rules" value={stats?.alertRules.total} />
            </Col>
            <Col span={6}>
              <Statistic title="System Settings" value={stats?.settings.total} />
            </Col>
          </Row>
          {stats?.events.oldestTimestamp && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="Oldest Event"
                  value={dayjs(stats.events.oldestTimestamp).format('YYYY-MM-DD HH:mm:ss')}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Newest Event"
                  value={dayjs(stats.events.newestTimestamp).format('YYYY-MM-DD HH:mm:ss')}
                />
              </Col>
            </Row>
          )}
        </Card>

        <Card title="Data Management Operations">
          <Space wrap>
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              Delete Old Events
            </Button>
            <Button
              type="default"
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              Export Events
            </Button>
            <Button
              type="default"
              icon={<BackupOutlined />}
              onClick={handleBackup}
            >
              Create Backup
            </Button>
            <Button
              type="default"
              icon={<ToolOutlined />}
              onClick={handleMaintenance}
            >
              Run Maintenance
            </Button>
          </Space>
        </Card>
      </Space>

      <Modal
        title="Delete Old Events"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={() => form.submit()}
        okText="Delete"
        okType="danger"
      >
        <Form form={form} layout="vertical" onFinish={handleDeleteOldEvents}>
          <Form.Item
            name="days"
            label="Delete events older than (days)"
            rules={[{ required: true, message: 'Please input number of days' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g., 90" />
          </Form.Item>
          <p style={{ color: '#ff4d4f' }}>
            Warning: This action cannot be undone. Events older than the specified number of days will be permanently deleted.
          </p>
        </Form>
      </Modal>

      <Modal
        title="Export Events"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={() => exportForm.submit()}
        width={600}
      >
        <Form form={exportForm} layout="vertical" onFinish={handleExportEvents}>
          <Form.Item name="dateRange" label="Date Range">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="limit" label="Maximum Number of Events">
            <InputNumber min={1} max={100000} defaultValue={10000} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#1890ff' }}>
            Events will be exported as a JSON file. Large exports may take some time.
          </p>
        </Form>
      </Modal>
    </div>
  );
};
