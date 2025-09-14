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

import EChartsAssetDistribution from '@components/Charts/EChartsAssetDistribution';
import EChartsAccessTrend from '@components/Charts/EChartsAccessTrend';
import EChartsQualityTrend from '@components/Charts/EChartsQualityTrend';
import EChartsUsageHeatmap from '@components/Charts/EChartsUsageHeatmap';
import type { Statistics } from '@/types/index';
import TextEffect from '@components/Animations/TextEffect';

import PageTransition from '@components/Animations/PageTransition';
import { motion } from 'framer-motion';



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
    <PageTransition>
      <div className="page-container">
        {/* 页面标题 */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <TextEffect 
                preset="fade-in-blur"
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                数据资产概览
              </TextEffect>
              <TextEffect 
                preset="slide"
                delay={0.3}
                className="text-gray-600"
              >
                全面了解您的数据资产状况，快速访问常用功能
              </TextEffect>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
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
            </motion.div>
          </div>
        </motion.div>

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
            title="指标"
            value={statistics?.metrics || 0}
            icon={<ProjectOutlined />}
            color="#722ED1"
            trend={{ value: 15, type: 'up' }}
            onClick={() => navigate('/discovery?type=metric')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <StatCard
            title="标签"
            value={statistics?.tags || 0}
            icon={<FileTextOutlined />}
            color="#FAAD14"
            trend={{ value: 5, type: 'up' }}
            onClick={() => navigate('/discovery?type=tag')}
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
          <EChartsAssetDistribution 
            data={chartData?.assetDistribution || []} 
            height={320}
          />
        </Col>
        <Col xs={24} lg={8}>
          <EChartsAccessTrend 
            data={chartData?.accessTrend || []} 
            height={320}
          />
        </Col>
        <Col xs={24} lg={8}>
          <EChartsQualityTrend 
            data={chartData?.qualityTrend || []} 
            height={320}
          />
        </Col>
      </Row>

      {/* 新增图表区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={24}>
          <EChartsUsageHeatmap 
            data={chartData?.usageHeatmap || []} 
            height={280}
            title="数据访问热力图"
          />
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
    </PageTransition>
  );
};

export default HomePage;
