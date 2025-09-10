import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Button,
  Space,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
} from 'antd';
import {
  SafetyCertificateOutlined,
  FileTextOutlined,
  BugOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DataStandards from '@components/Governance/DataStandards';
import QualityRules from '@components/Governance/QualityRules';
import MetadataManagement from '@components/Governance/MetadataManagement';
import GovernanceReports from '@components/Governance/GovernanceReports';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;

const GovernancePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStandards: 24,
    activeRules: 15,
    qualityScore: 92.5,
    complianceRate: 88.7,
    totalAssets: 156,
    issuesCount: 8,
  });

  useEffect(() => {
    // 模拟加载统计数据
    const loadStats = async () => {
      // 实际项目中这里会调用API
      await new Promise(resolve => setTimeout(resolve, 500));
    };
    loadStats();
  }, []);

  const renderOverview = () => (
    <div>
      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据标准"
              value={stats.totalStandards}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质量规则"
              value={stats.activeRules}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质量分数"
              value={stats.qualityScore}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合规率"
              value={stats.complianceRate}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 治理健康度 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="数据质量健康度" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>完整性</Text>
                <Progress percent={96} size="small" />
              </div>
              <div>
                <Text>准确性</Text>
                <Progress percent={94} size="small" />
              </div>
              <div>
                <Text>一致性</Text>
                <Progress percent={91} size="small" />
              </div>
              <div>
                <Text>有效性</Text>
                <Progress percent={97} size="small" />
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="合规性概览" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>GDPR</Text>
                <Progress percent={95} size="small" status="success" />
              </div>
              <div>
                <Text>个人信息保护法</Text>
                <Progress percent={89} size="small" status="active" />
              </div>
              <div>
                <Text>SOX</Text>
                <Progress percent={98} size="small" status="success" />
              </div>
              <div>
                <Text>网络安全法</Text>
                <Progress percent={87} size="small" status="active" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 告警和建议 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="治理告警" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="发现8个数据质量问题"
                description="建议检查用户表的邮箱格式验证规则"
                type="warning"
                showIcon
                action={
                  <Button size="small" onClick={() => setActiveTab('quality')}>
                    查看详情
                  </Button>
                }
              />
              <Alert
                message="3个数据标准需要更新"
                description="手机号格式标准建议更新以支持新号段"
                type="info"
                showIcon
                action={
                  <Button size="small" onClick={() => setActiveTab('standards')}>
                    立即处理
                  </Button>
                }
              />
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="治理建议" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="优化数据质量检查频率"
                description="建议对核心业务表增加日检查规则"
                type="success"
                showIcon
                action={
                  <Button size="small" type="primary">
                    采纳建议
                  </Button>
                }
              />
              <Alert
                message="完善元数据标注"
                description="52%的数据表缺少业务描述信息"
                type="info"
                showIcon
                action={
                  <Button size="small" onClick={() => setActiveTab('metadata')}>
                    去完善
                  </Button>
                }
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="page-container">
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/')}>首页</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>数据治理</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <SafetyCertificateOutlined /> 数据治理
        </Title>
        <Text type="secondary">
          确保数据质量、合规性和标准化，建立企业数据治理体系
        </Text>
      </div>

      {/* 主要内容区域 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <BarChartOutlined />
                治理概览
              </Space>
            ),
            children: renderOverview(),
          },
          {
            key: 'standards',
            label: (
              <Space>
                <FileTextOutlined />
                数据标准
              </Space>
            ),
            children: <DataStandards />,
          },
          {
            key: 'quality',
            label: (
              <Space>
                <BugOutlined />
                质量规则
              </Space>
            ),
            children: <QualityRules />,
          },
          {
            key: 'metadata',
            label: (
              <Space>
                <DatabaseOutlined />
                元数据管理
              </Space>
            ),
            children: <MetadataManagement />,
          },
          {
            key: 'reports',
            label: (
              <Space>
                <FileTextOutlined />
                治理报告
              </Space>
            ),
            children: <GovernanceReports />,
          },
        ]}
      />
    </div>
  );
};

export default GovernancePage;
