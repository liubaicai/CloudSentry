import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, BulbOutlined } from '@ant-design/icons';

export const AnalysisPage: React.FC = () => {
  return (
    <div style={{ padding: 12 }}>
      <Card title="聚合分析" extra={<BarChartOutlined />} size="small">
        <Row gutter={12}>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="分析功能"
                value="即将推出"
                prefix={<BarChartOutlined />}
              />
              <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                安全事件的高级聚合和关联分析功能将在此处提供。
                包括模式检测、异常检测和威胁情报关联等功能。
              </p>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="威胁情报"
                value="即将推出"
                prefix={<BulbOutlined />}
              />
              <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                威胁情报源集成和IOC匹配功能将在此处提供。
              </p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
