import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Modal, Form, InputNumber, message, DatePicker, Typography } from 'antd';
import {
  DatabaseOutlined,
  DeleteOutlined,
  ExportOutlined,
  SaveOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { configService } from '../services/configService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

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
    } catch {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldEvents = async (values: any) => {
    try {
      const result = await configService.dataManagement.deleteOldEvents(values.days);
      message.success(`已删除 ${result.count} 条事件`);
      setDeleteModalVisible(false);
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除事件失败');
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

      message.success('事件导出成功');
      setExportModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || '导出事件失败');
    }
  };

  const handleBackup = async () => {
    Modal.confirm({
      title: '创建备份',
      content: '确定要创建数据库备份吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await configService.dataManagement.createBackup();
          message.info(result.message);
        } catch (error: any) {
          message.error(error.response?.data?.error || '创建备份失败');
        }
      },
    });
  };

  const handleMaintenance = async () => {
    Modal.confirm({
      title: '运行数据库维护',
      content: '这将优化数据库，是否继续？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await configService.dataManagement.runMaintenance();
          message.success('数据库维护完成');
        } catch (error: any) {
          message.error(error.response?.data?.error || '运行维护失败');
        }
      },
    });
  };

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
            <DatabaseOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 600 }}>数据管理</Title>
            <Text style={{ color: '#94A3B8' }}>管理数据库、导出数据和执行维护操作</Text>
          </div>
        </div>
      </Card>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card 
          title={<><DatabaseOutlined style={{ color: '#60A5FA', marginRight: 8 }} />数据库统计</>} 
          loading={loading} 
          size="small"
          style={{ 
            border: '1px solid #334155', 
            borderRadius: 8, 
            background: '#1E293B' 
          }}
          headStyle={{ borderBottom: '1px solid #334155', color: '#F8FAFC' }}
        >
          <Row gutter={12}>
            <Col span={6}>
              <Statistic 
                title={<span style={{ color: '#94A3B8' }}>事件总数</span>} 
                value={stats?.events.total} 
                valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title={<span style={{ color: '#94A3B8' }}>用户总数</span>} 
                value={stats?.users.total} 
                valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title={<span style={{ color: '#94A3B8' }}>告警规则数</span>} 
                value={stats?.alertRules.total} 
                valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title={<span style={{ color: '#94A3B8' }}>系统设置数</span>} 
                value={stats?.settings.total} 
                valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
              />
            </Col>
          </Row>
          {stats?.events.oldestTimestamp && (
            <Row gutter={12} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#94A3B8' }}>最早事件</span>}
                  value={dayjs(stats.events.oldestTimestamp).format('YYYY-MM-DD HH:mm:ss')}
                  valueStyle={{ color: '#F8FAFC', fontWeight: 600, fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#94A3B8' }}>最新事件</span>}
                  value={dayjs(stats.events.newestTimestamp).format('YYYY-MM-DD HH:mm:ss')}
                  valueStyle={{ color: '#F8FAFC', fontWeight: 600, fontSize: 16 }}
                />
              </Col>
            </Row>
          )}
        </Card>

        <Card 
          title={<><ToolOutlined style={{ color: '#22C55E', marginRight: 8 }} />数据管理操作</>} 
          size="small"
          style={{ 
            border: '1px solid #334155', 
            borderRadius: 8, 
            background: '#1E293B' 
          }}
          headStyle={{ borderBottom: '1px solid #334155', color: '#F8FAFC' }}
        >
          <Space wrap>
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
              size="small"
            >
              删除旧事件
            </Button>
            <Button
              type="default"
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
              size="small"
            >
              导出事件
            </Button>
            <Button
              type="default"
              icon={<SaveOutlined />}
              onClick={handleBackup}
              size="small"
            >
              创建备份
            </Button>
            <Button
              type="default"
              icon={<ToolOutlined />}
              onClick={handleMaintenance}
              size="small"
            >
              运行维护
            </Button>
          </Space>
        </Card>
      </Space>

      <Modal
        title="删除旧事件"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={() => form.submit()}
        okText="删除"
        cancelText="取消"
        okType="danger"
      >
        <Form form={form} layout="vertical" onFinish={handleDeleteOldEvents}>
          <Form.Item
            name="days"
            label="删除超过多少天的事件"
            rules={[{ required: true, message: '请输入天数' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如：90" />
          </Form.Item>
          <p style={{ color: '#ff4d4f', fontSize: 13 }}>
            警告：此操作不可撤销。超过指定天数的事件将被永久删除。
          </p>
        </Form>
      </Modal>

      <Modal
        title="导出事件"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={() => exportForm.submit()}
        okText="导出"
        cancelText="取消"
        width={600}
      >
        <Form form={exportForm} layout="vertical" onFinish={handleExportEvents}>
          <Form.Item name="dateRange" label="日期范围">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="limit" label="最大事件数">
            <InputNumber min={1} max={100000} defaultValue={10000} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#1890ff', fontSize: 13 }}>
            事件将导出为JSON文件。大量导出可能需要一些时间。
          </p>
        </Form>
      </Modal>
    </div>
  );
};
