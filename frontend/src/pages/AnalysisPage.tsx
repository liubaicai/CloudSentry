import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { BarChartOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const AnalysisPage: React.FC = () => {
  return (
    <div style={{ padding: 12 }}>
      {/* Header Banner */}
      <Card
        size="small"
        style={{
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
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BarChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>聚合分析</Title>
            <Text type="secondary">安全事件的高级聚合和关联分析</Text>
          </div>
        </div>
      </Card>

      <Row gutter={12}>
        <Col span={12}>
          <Card 
            size="small"
            style={{ 
              borderRadius: 8, 
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>分析功能</span>}
              value="即将推出"
              prefix={<BarChartOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
            <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(0, 0, 0, 0.45)' }}>
              安全事件的高级聚合和关联分析功能将在此处提供。
              包括模式检测、异常检测和威胁情报关联等功能。
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            size="small"
            style={{ 
              borderRadius: 8, 
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>威胁情报</span>}
              value="即将推出"
              prefix={<BulbOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
            <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(0, 0, 0, 0.45)' }}>
              威胁情报源集成和IOC匹配功能将在此处提供。
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
