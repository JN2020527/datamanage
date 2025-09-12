import React from 'react';
import { Card, Row, Col, Button, Typography, Tag, Space } from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  EyeOutlined,
  CopyOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  components: any[];
  config: any;
  tags: string[];
}

interface DashboardTemplatesProps {
  onSelectTemplate: (template: DashboardTemplate) => void;
  onPreviewTemplate: (template: DashboardTemplate) => void;
}

// 预设看板模板
const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'sales-dashboard',
    name: '销售业绩看板',
    description: '展示销售团队的关键业绩指标，包括销售额、订单量、转化率等核心数据',
    category: '销售分析',
    thumbnail: '',
    tags: ['销售', '业绩', 'KPI'],
    components: [
      {
        id: 'sales-metric-1',
        type: 'metric-card',
        name: '本月销售额',
        config: {
          title: '本月销售额',
          value: 1250000,
          unit: '元',
          prefix: '￥',
          color: '#52c41a',
          trend: { value: 12.5, direction: 'up' },
        },
        position: { x: 20, y: 20 },
        size: { width: 200, height: 120 },
        zIndex: 1,
      },
      {
        id: 'sales-metric-2',
        type: 'metric-card',
        name: '订单数量',
        config: {
          title: '订单数量',
          value: 3456,
          unit: '单',
          color: '#1890ff',
          trend: { value: 8.3, direction: 'up' },
        },
        position: { x: 240, y: 20 },
        size: { width: 200, height: 120 },
        zIndex: 2,
      },
      {
        id: 'sales-chart-1',
        type: 'chart-line',
        name: '销售趋势',
        config: {
          title: '月度销售趋势',
          dataSource: 'sales',
          xAxis: 'month',
          yAxis: ['sales', 'orders'],
          colors: ['#5470c6', '#91cc75'],
        },
        position: { x: 20, y: 160 },
        size: { width: 420, height: 280 },
        zIndex: 3,
      },
      {
        id: 'sales-chart-2',
        type: 'chart-pie',
        name: '产品销售占比',
        config: {
          title: '产品销售占比',
          dataSource: 'products',
          nameField: 'product',
          valueField: 'sales',
          showPercentage: true,
        },
        position: { x: 460, y: 20 },
        size: { width: 300, height: 420 },
        zIndex: 4,
      },
    ],
    config: {
      theme: 'default',
      layout: {
        background: '#f0f2f5',
        padding: 20,
        grid: { enabled: true, size: 20, color: 'rgba(0,0,0,0.1)' },
      },
    },
  },
  {
    id: 'operations-dashboard',
    name: '运营数据看板',
    description: '监控网站流量、用户行为、转化率等关键运营指标的实时数据',
    category: '运营分析',
    thumbnail: '',
    tags: ['运营', '流量', '转化'],
    components: [
      {
        id: 'ops-metric-1',
        type: 'metric-card',
        name: '今日访问量',
        config: {
          title: '今日访问量',
          value: 45678,
          unit: 'PV',
          color: '#722ed1',
          trend: { value: 15.2, direction: 'up' },
        },
        position: { x: 20, y: 20 },
        size: { width: 180, height: 100 },
        zIndex: 1,
      },
      {
        id: 'ops-metric-2',
        type: 'metric-card',
        name: '转化率',
        config: {
          title: '转化率',
          value: 3.24,
          unit: '%',
          color: '#fa541c',
          trend: { value: 2.1, direction: 'up' },
        },
        position: { x: 220, y: 20 },
        size: { width: 180, height: 100 },
        zIndex: 2,
      },
      {
        id: 'ops-chart-1',
        type: 'chart-area',
        name: '访问趋势',
        config: {
          title: '7天访问趋势',
          dataSource: 'traffic',
          xAxis: 'date',
          yAxis: ['pv', 'uv'],
          stacked: false,
        },
        position: { x: 20, y: 140 },
        size: { width: 500, height: 260 },
        zIndex: 3,
      },
      {
        id: 'ops-chart-2',
        type: 'chart-bar',
        name: '渠道分析',
        config: {
          title: '流量渠道分析',
          dataSource: 'channels',
          xAxis: 'channel',
          yAxis: ['traffic'],
          colors: ['#13c2c2'],
        },
        position: { x: 540, y: 140 },
        size: { width: 300, height: 260 },
        zIndex: 4,
      },
    ],
    config: {
      theme: 'default',
      layout: {
        background: '#f6f6f6',
        padding: 20,
        grid: { enabled: true, size: 20, color: 'rgba(0,0,0,0.08)' },
      },
    },
  },
  {
    id: 'finance-dashboard',
    name: '财务分析看板',
    description: '全面展示企业财务状况，包括收入、支出、利润等核心财务指标',
    category: '财务分析',
    thumbnail: '',
    tags: ['财务', '收入', '利润'],
    components: [
      {
        id: 'finance-metric-1',
        type: 'metric-card',
        name: '本月收入',
        config: {
          title: '本月收入',
          value: 2890000,
          unit: '元',
          prefix: '￥',
          color: '#52c41a',
          trend: { value: 18.5, direction: 'up' },
        },
        position: { x: 20, y: 20 },
        size: { width: 200, height: 120 },
        zIndex: 1,
      },
      {
        id: 'finance-metric-2',
        type: 'metric-card',
        name: '净利润',
        config: {
          title: '净利润',
          value: 456000,
          unit: '元',
          prefix: '￥',
          color: '#1890ff',
          trend: { value: 6.8, direction: 'up' },
        },
        position: { x: 240, y: 20 },
        size: { width: 200, height: 120 },
        zIndex: 2,
      },
      {
        id: 'finance-chart-1',
        type: 'chart-line',
        name: '收支趋势',
        config: {
          title: '月度收支趋势',
          dataSource: 'finance',
          xAxis: 'month',
          yAxis: ['income', 'expense', 'profit'],
          colors: ['#52c41a', '#fa541c', '#1890ff'],
        },
        position: { x: 20, y: 160 },
        size: { width: 540, height: 280 },
        zIndex: 3,
      },
    ],
    config: {
      theme: 'business',
      layout: {
        background: '#f9f9f9',
        padding: 20,
        grid: { enabled: true, size: 20, color: 'rgba(0,0,0,0.06)' },
      },
    },
  },
  {
    id: 'executive-dashboard',
    name: '高管驾驶舱',
    description: '为高级管理层提供企业全局视角，汇聚各部门核心KPI和战略指标',
    category: '综合分析',
    thumbnail: '',
    tags: ['高管', '战略', 'KPI'],
    components: [
      {
        id: 'exec-text-1',
        type: 'text-block',
        name: '标题',
        config: {
          content: '企业经营驾驶舱',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#001529',
          align: 'center',
          backgroundColor: 'transparent',
          padding: 16,
        },
        position: { x: 20, y: 20 },
        size: { width: 760, height: 60 },
        zIndex: 1,
      },
      {
        id: 'exec-metric-1',
        type: 'metric-card',
        name: '总收入',
        config: {
          title: '总收入',
          value: 12500000,
          unit: '万元',
          prefix: '￥',
          color: '#52c41a',
          trend: { value: 22.5, direction: 'up' },
        },
        position: { x: 20, y: 100 },
        size: { width: 180, height: 120 },
        zIndex: 2,
      },
      {
        id: 'exec-metric-2',
        type: 'metric-card',
        name: '客户数',
        config: {
          title: '客户数',
          value: 8934,
          unit: '个',
          color: '#1890ff',
          trend: { value: 15.3, direction: 'up' },
        },
        position: { x: 220, y: 100 },
        size: { width: 180, height: 120 },
        zIndex: 3,
      },
      {
        id: 'exec-metric-3',
        type: 'metric-card',
        name: '市场份额',
        config: {
          title: '市场份额',
          value: 23.8,
          unit: '%',
          color: '#722ed1',
          trend: { value: 3.2, direction: 'up' },
        },
        position: { x: 420, y: 100 },
        size: { width: 180, height: 120 },
        zIndex: 4,
      },
      {
        id: 'exec-metric-4',
        type: 'metric-card',
        name: '员工满意度',
        config: {
          title: '员工满意度',
          value: 87.5,
          unit: '分',
          color: '#fa8c16',
          trend: { value: 4.2, direction: 'up' },
        },
        position: { x: 620, y: 100 },
        size: { width: 180, height: 120 },
        zIndex: 5,
      },
      {
        id: 'exec-chart-1',
        type: 'chart-bar',
        name: '部门业绩',
        config: {
          title: '各部门业绩对比',
          dataSource: 'departments',
          xAxis: 'department',
          yAxis: ['performance'],
          colors: ['#13c2c2'],
        },
        position: { x: 20, y: 240 },
        size: { width: 380, height: 200 },
        zIndex: 6,
      },
      {
        id: 'exec-chart-2',
        type: 'chart-pie',
        name: '业务构成',
        config: {
          title: '业务收入构成',
          dataSource: 'business',
          nameField: 'business',
          valueField: 'revenue',
          roseType: true,
        },
        position: { x: 420, y: 240 },
        size: { width: 380, height: 200 },
        zIndex: 7,
      },
    ],
    config: {
      theme: 'business',
      layout: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 20,
        grid: { enabled: false, size: 20, color: 'rgba(255,255,255,0.1)' },
      },
    },
  },
];

const DashboardTemplates: React.FC<DashboardTemplatesProps> = ({
  onSelectTemplate,
  onPreviewTemplate,
}) => {
  const getIconByCategory = (category: string) => {
    switch (category) {
      case '销售分析': return <BarChartOutlined />;
      case '运营分析': return <LineChartOutlined />;
      case '财务分析': return <PieChartOutlined />;
      case '综合分析': return <DashboardOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '销售分析': return '#52c41a';
      case '运营分析': return '#1890ff';
      case '财务分析': return '#722ed1';
      case '综合分析': return '#fa541c';
      default: return '#13c2c2';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>选择看板模板</Title>
        <Paragraph type="secondary">
          从预设模板快速开始，或选择空白模板自由创建
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {/* 空白模板 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{ height: 320 }}
            cover={
              <div
                style={{
                  height: 160,
                  background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #d9d9d9',
                }}
              >
                <PlusOutlined style={{ fontSize: 48, color: '#999' }} />
              </div>
            }
            actions={[
              <Button
                type="primary"
                block
                onClick={() => onSelectTemplate({
                  id: 'blank',
                  name: '空白看板',
                  description: '从零开始创建您的专属看板',
                  category: '自定义',
                  thumbnail: '',
                  tags: [],
                  components: [],
                  config: {
                    theme: 'default',
                    layout: {
                      background: '#f0f2f5',
                      padding: 20,
                      grid: { enabled: true, size: 20, color: 'rgba(0,0,0,0.1)' },
                    },
                  },
                })}
              >
                开始创建
              </Button>
            ]}
          >
            <Card.Meta
              title="空白看板"
              description="从零开始创建您的专属看板"
            />
          </Card>
        </Col>

        {/* 预设模板 */}
        {dashboardTemplates.map((template) => (
          <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
            <Card
              hoverable
              style={{ height: 320 }}
              cover={
                <div
                  style={{
                    height: 160,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 48,
                    position: 'relative',
                  }}
                >
                  {getIconByCategory(template.category)}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: 12,
                    }}
                  >
                    <Tag color={getCategoryColor(template.category)}>
                      {template.category}
                    </Tag>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {template.components.length} 个组件
                  </div>
                </div>
              }
              actions={[
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => onPreviewTemplate(template)}
                >
                  预览
                </Button>,
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={() => onSelectTemplate(template)}
                >
                  使用模板
                </Button>,
              ]}
            >
              <Card.Meta
                title={template.name}
                description={
                  <div>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 8, minHeight: 40 }}
                    >
                      {template.description}
                    </Paragraph>
                    <Space wrap>
                      {template.tags.map((tag) => (
                        <Tag key={tag} size="small">
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardTemplates;
