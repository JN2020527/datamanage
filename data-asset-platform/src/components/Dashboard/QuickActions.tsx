import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  FolderOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      key: 'search',
      icon: <SearchOutlined />,
      title: '资产发现',
      description: '搜索和浏览数据资产',
      color: '#1677FF',
      path: '/discovery',
    },
    {
      key: 'create',
      icon: <PlusOutlined />,
      title: '创建资产',
      description: '创建新的数据资产',
      color: '#52C41A',
      path: '/development',
    },
    {
      key: 'governance',
      icon: <SafetyCertificateOutlined />,
      title: '质量治理',
      description: '数据质量管理',
      color: '#FAAD14',
      path: '/governance',
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      title: '数据分析',
      description: '创建分析报表',
      color: '#722ED1',
      path: '/analysis',
    },
    {
      key: 'assets',
      icon: <FolderOutlined />,
      title: '我的资产',
      description: '管理我的数据资产',
      color: '#13C2C2',
      path: '/development/my',
    },
    {
      key: 'reports',
      icon: <LineChartOutlined />,
      title: '我的报表',
      description: '查看我的分析报表',
      color: '#EB2F96',
      path: '/analysis/my-reports',
    },
  ];

  return (
    <Card title="快速入口" className="quick-actions-card">
      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col xs={12} sm={8} md={6} lg={4} key={action.key}>
            <Card
              className="quick-action-item"
              bodyStyle={{ padding: '20px 16px' }}
              onClick={() => navigate(action.path)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.borderColor = action.color;
                target.style.boxShadow = `0 4px 12px ${action.color}20`;
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.borderColor = '#f0f0f0';
                target.style.boxShadow = 'none';
                target.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  color: action.color,
                  marginBottom: '12px',
                }}
              >
                {action.icon}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#262626',
                  marginBottom: '4px',
                }}
              >
                {action.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#8c8c8c',
                  lineHeight: '1.4',
                }}
              >
                {action.description}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickActions;
