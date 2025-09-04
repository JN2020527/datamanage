import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Button, Space } from 'antd';
import {
  DatabaseOutlined,
  ProjectOutlined,
  FileTextOutlined,
  DashboardOutlined,
  StarOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '@mock/api';
import StatCard from '@components/Dashboard/StatCard';
import QuickActions from '@components/Dashboard/QuickActions';
import RecentActivities from '@components/Dashboard/RecentActivities';
import PopularAssets from '@components/Dashboard/PopularAssets';
import AssetDistributionChart from '@components/Charts/AssetDistributionChart';
import AccessTrendChart from '@components/Charts/AccessTrendChart';
import QualityTrendChart from '@components/Charts/QualityTrendChart';
import type { Statistics } from '@types/index';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        api.getStatistics(),
        api.getChartData(),
      ]);
      
      setStatistics(statsResponse.data);
      setChartData(chartsResponse.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 页面标题 */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">
              数据资产概览
            </Title>
            <Text className="page-description">
              全面了解您的数据资产状况，快速访问常用功能
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={refreshing}
              onClick={handleRefresh}
            >
              刷新
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => navigate('/system/settings')}
            >
              设置
            </Button>
          </Space>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="总资产"
            value={statistics?.totalAssets || 0}
            icon={<DatabaseOutlined />}
            color="#1677FF"
            trend={{ value: 12, type: 'up' }}
            onClick={() => navigate('/discovery')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="数据表"
            value={statistics?.tables || 0}
            icon={<DatabaseOutlined />}
            color="#52C41A"
            trend={{ value: 8, type: 'up' }}
            onClick={() => navigate('/discovery?type=table')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="数据模型"
            value={statistics?.models || 0}
            icon={<ProjectOutlined />}
            color="#722ED1"
            trend={{ value: 15, type: 'up' }}
            onClick={() => navigate('/discovery?type=model')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="报表"
            value={statistics?.reports || 0}
            icon={<FileTextOutlined />}
            color="#FAAD14"
            trend={{ value: 5, type: 'up' }}
            onClick={() => navigate('/discovery?type=report')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="质量评分"
            value={statistics?.qualityScore || 0}
            suffix="%"
            icon={<StarOutlined />}
            color="#13C2C2"
            trend={{ value: 2, type: 'up' }}
            onClick={() => navigate('/governance/reports')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="今日访问"
            value={statistics?.todayAccess || 0}
            icon={<EyeOutlined />}
            color="#EB2F96"
            trend={{ value: 18, type: 'up' }}
            onClick={() => navigate('/system/logs')}
          />
        </Col>
      </Row>

      {/* 图表展示区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={8}>
          <div className="card">
            <AssetDistributionChart 
              data={chartData?.assetDistribution || []} 
              height={280}
            />
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="card">
            <AccessTrendChart 
              data={chartData?.accessTrend || []} 
              height={280}
            />
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="card">
            <QualityTrendChart 
              data={chartData?.qualityTrend || []} 
              height={280}
            />
          </div>
        </Col>
      </Row>

      {/* 快速入口 */}
      <div style={{ marginBottom: '32px' }}>
        <QuickActions />
      </div>

      {/* 最近活动和热门资产 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <RecentActivities />
        </Col>
        <Col xs={24} lg={12}>
          <PopularAssets />
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
