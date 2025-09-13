import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const TestDashboard: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <DashboardOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <Title level={2}>看板设计测试页面</Title>
            <Paragraph>
              如果您能看到此页面，说明基础组件正常工作
            </Paragraph>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" size="large">
              测试按钮
            </Button>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <Title level={4}>系统状态</Title>
            <ul>
              <li>✅ React 组件渲染正常</li>
              <li>✅ Ant Design 组件正常</li>
              <li>✅ 图标库正常</li>
              <li>✅ 路由系统正常</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TestDashboard;
