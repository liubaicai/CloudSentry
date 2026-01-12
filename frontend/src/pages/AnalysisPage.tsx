import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

export const AnalysisPage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Aggregated Analysis" extra={<BarChartOutlined />}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Analysis Feature"
                value="Coming Soon"
                prefix={<BarChartOutlined />}
              />
              <p style={{ marginTop: 16 }}>
                Advanced aggregation and correlation analysis of security events will be available here.
                This includes pattern detection, anomaly detection, and threat intelligence correlation.
              </p>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Threat Intelligence"
                value="Coming Soon"
                prefix={<BarChartOutlined />}
              />
              <p style={{ marginTop: 16 }}>
                Integration with threat intelligence feeds and IOC matching will be available here.
              </p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
