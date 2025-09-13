import React from 'react';
import { Layout } from 'antd';
import MultiTableDemo from '../../components/Analysis/ReportDesigner/MultiTableDemo';

const { Content } = Layout;

const MultiTableTest: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        <MultiTableDemo />
      </Content>
    </Layout>
  );
};

export default MultiTableTest; 