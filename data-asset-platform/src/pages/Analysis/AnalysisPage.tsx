import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const AnalysisPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>敏捷分析</Title>
      <Card>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          敏捷分析页面正在开发中...
        </div>
      </Card>
    </div>
  );
};

export default AnalysisPage;
