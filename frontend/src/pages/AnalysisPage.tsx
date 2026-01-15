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
            <BarChartOutlined style={{ fontSize: 24, color: '#60A5FA' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 600 }}>聚合分析</Title>
            <Text style={{ color: '#94A3B8' }}>安全事件的高级聚合和关联分析</Text>
          </div>
        </div>
      </Card>

      <Row gutter={12}>
        <Col span={12}>
          <Card 
            size="small"
            style={{ 
              border: '1px solid #334155', 
              borderRadius: 8, 
              background: '#1E293B' 
            }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>分析功能</span>}
              value="即将推出"
              prefix={<BarChartOutlined style={{ color: '#60A5FA' }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
            />
            <p style={{ marginTop: 12, fontSize: 13, color: '#94A3B8' }}>
              安全事件的高级聚合和关联分析功能将在此处提供。
              包括模式检测、异常检测和威胁情报关联等功能。
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            size="small"
            style={{ 
              border: '1px solid #334155', 
              borderRadius: 8, 
              background: '#1E293B' 
            }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>威胁情报</span>}
              value="即将推出"
              prefix={<BulbOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 600 }}
            />
            <p style={{ marginTop: 12, fontSize: 13, color: '#94A3B8' }}>
              威胁情报源集成和IOC匹配功能将在此处提供。
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
