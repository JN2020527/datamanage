import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const SystemPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>系统管理</Title>
      <Card>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          系统管理页面正在开发中...
        </div>
      </Card>
    </div>
  );
};

export default SystemPage;
