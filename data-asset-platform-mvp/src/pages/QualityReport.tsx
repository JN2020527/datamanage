import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Alert, 
  Tooltip,
  message,
  Spin,
  Empty,
  Tabs
} from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Radar, Line } from '@ant-design/charts';
import '@/styles/globals.less';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface QualityReportPageProps {}

const QualityReportPage: React.FC<QualityReportPageProps> = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (assetId) {
      // 模拟加载质量报告数据
      setLoading(true);
      setTimeout(() => {
        // 模拟数据
        setCurrentReport({
          overallScore: 85,
          dimensionScores: {
            completeness: 90,
            accuracy: 88,
            consistency: 82,
            timeliness: 80
          },
          ruleResults: [
            {
              ruleId: "rule-1",
              ruleName: "字段完整性检查",
              dimension: "completeness",
              status: "passed",
              score: 95,
              description: "检查所有必填字段是否完整"
            },
            {
              ruleId: "rule-2", 
              ruleName: "数据格式验证",
              dimension: "accuracy",
              status: "passed",
              score: 88,
              description: "验证字段格式是否符合规范"
            },
            {
              ruleId: "rule-3",
              ruleName: "重复数据检查",
              dimension: "consistency", 
              status: "warning",
              score: 75,
              description: "检查是否存在重复记录"
            }
          ],
          issues: [
            {
              severity: "medium",
              description: "发现3条重复记录",
              affectedFields: ["user_id", "email"],
              suggestion: "建议清理重复数据并添加唯一约束"
            }
          ],
          trend: [
            { date: "2024-01-01", score: 82 },
            { date: "2024-01-02", score: 83 },
            { date: "2024-01-03", score: 85 },
            { date: "2024-01-04", score: 84 },
            { date: "2024-01-05", score: 85 }
          ],
          lastUpdated: "2024-01-05 10:30:00"
        });
        setLoading(false);
      }, 1000);
    }
  }, [assetId]);

  const handleTriggerCheck = async () => {
    if (!assetId) return;
    
    setCheckLoading(true);
    try {
      // 模拟触发质量检查
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('质量检查已完成，报告已更新');
      // 重新加载数据（这里只是模拟）
      setCurrentReport({
        ...currentReport,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (err) {
      message.error('质量检查失败，请稍后重试');
    } finally {
      setCheckLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (score >= 70) return <WarningOutlined style={{ color: '#faad14' }} />;
    return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  // 维度雷达图配置
  const dimensionRadarConfig = React.useMemo(() => {
    if (!currentReport?.dimensionScores) return null;
    
    const data = Object.entries(currentReport.dimensionScores).map(([dimension, score]) => ({
      dimension: dimension === 'completeness' ? '完整性' : 
                 dimension === 'accuracy' ? '准确性' :
                 dimension === 'consistency' ? '一致性' : '及时性',
      score: score,
      max: 100
    }));

    return {
      data,
      xField: 'dimension',
      yField: 'score',
      meta: {
        score: { min: 0, max: 100 }
      },
      radius: 0.8,
      area: {
        style: {
          fillOpacity: 0.3,
          fill: '#1677ff'
        }
      },
      point: {
        size: 4,
        style: {
          fill: '#1677ff',
          stroke: '#fff',
          strokeWidth: 2
        }
      },
      line: {
        style: {
          stroke: '#1677ff',
          strokeWidth: 2
        }
      }
    };
  }, [currentReport?.dimensionScores]);

  // 趋势图配置
  const trendConfig = React.useMemo(() => {
    if (!currentReport?.trend) return null;

    return {
      data: currentReport.trend,
      xField: 'date',
      yField: 'score',
      smooth: true,
      color: '#1677ff',
      point: {
        size: 3,
        style: {
          fill: '#1677ff',
          stroke: '#fff',
          strokeWidth: 2
        }
      },
      tooltip: {
        formatter: (datum: any) => ({
          name: '质量评分',
          value: `${datum.score}分`
        })
      }
    };
  }, [currentReport?.trend]);

  // 规则结果列配置
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 200,
    },
    {
      title: '维度',
      dataIndex: 'dimension',
      key: 'dimension',
      width: 120,
      render: (dimension: string) => {
        const dimensionMap: Record<string, { text: string; color: string }> = {
          completeness: { text: '完整性', color: 'blue' },
          accuracy: { text: '准确性', color: 'green' },
          consistency: { text: '一致性', color: 'orange' },
          timeliness: { text: '及时性', color: 'purple' }
        };
        const info = dimensionMap[dimension] || { text: dimension, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
          passed: { text: '通过', color: 'success', icon: <CheckCircleOutlined /> },
          failed: { text: '失败', color: 'error', icon: <CloseCircleOutlined /> },
          warning: { text: '警告', color: 'warning', icon: <WarningOutlined /> }
        };
        const info = statusMap[status] || { text: status, color: 'default', icon: null };
        return (
          <Tag color={info.color} icon={info.icon}>
            {info.text}
          </Tag>
        );
      }
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score: number) => (
        <Text strong style={{ color: getScoreColor(score) }}>
          {score}分
        </Text>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (description: string) => (
        <Tooltip title={description}>
          {description}
        </Tooltip>
      )
    }
  ];

  // 问题列配置
  const issueColumns = [
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: string) => {
        const severityMap: Record<string, { text: string; color: string }> = {
          high: { text: '高', color: 'error' },
          medium: { text: '中', color: 'warning' },
          low: { text: '低', color: 'processing' }
        };
        const info = severityMap[severity] || { text: severity, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (description: string) => (
        <Tooltip title={description}>
          {description}
        </Tooltip>
      )
    },
    {
      title: '影响字段',
      dataIndex: 'affectedFields',
      key: 'affectedFields',
      width: 200,
      render: (fields: string[]) => (
        <Space size={[4, 4]} wrap>
          {fields?.map(field => (
            <Tag key={field}>{field}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
      ellipsis: { showTitle: false },
      render: (suggestion: string) => (
        <Tooltip title={suggestion}>
          <Text type="secondary">{suggestion}</Text>
        </Tooltip>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>加载质量报告中...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={() => window.location.reload()}>
            重试
          </Button>
        }
      />
    );
  }

  if (!currentReport) {
    return (
      <Empty
        description="暂无质量报告"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={handleTriggerCheck} loading={checkLoading}>
          开始质量检查
        </Button>
      </Empty>
    );
  }

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
              >
                返回
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                数据质量报告
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">
                最后更新: {currentReport.lastUpdated}
              </Text>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                loading={checkLoading}
                onClick={handleTriggerCheck}
              >
                重新检查
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 总体概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="app-card">
            <Statistic
              title="总体评分"
              value={currentReport.overallScore}
              suffix="分"
              prefix={getScoreIcon(currentReport.overallScore)}
              valueStyle={{ 
                color: getScoreColor(currentReport.overallScore),
                fontSize: '32px',
                fontWeight: 'bold'
              }}
            />
            <Progress 
              percent={currentReport.overallScore} 
              strokeColor={getScoreColor(currentReport.overallScore)}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="app-card">
            <Statistic
              title="检查规则数"
              value={currentReport.ruleResults?.length || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="app-card">
            <Statistic
              title="通过规则数"
              value={currentReport.ruleResults?.filter((r: any) => r.status === 'passed').length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="app-card">
            <Statistic
              title="问题数量"
              value={currentReport.issues?.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <Space>
              <TrophyOutlined />
              概览
            </Space>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            {/* 维度评分雷达图 */}
            <Col span={12}>
              <Card title="质量维度评分" className="app-card">
                {dimensionRadarConfig ? (
                  <div style={{ height: 300 }}>
                    <Radar {...dimensionRadarConfig} />
                  </div>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无维度数据" />
                )}
              </Card>
            </Col>

            {/* 质量趋势 */}
            <Col span={12}>
              <Card title="质量趋势" className="app-card">
                {trendConfig ? (
                  <div style={{ height: 300 }}>
                    <Line {...trendConfig} />
                  </div>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无趋势数据" />
                )}
              </Card>
            </Col>

            {/* 维度详情 */}
            <Col span={24}>
              <Card title="维度详情" className="app-card">
                <Row gutter={[16, 16]}>
                  {Object.entries(currentReport.dimensionScores || {}).map(([dimension, score]) => {
                    const dimensionMap: Record<string, string> = {
                      completeness: '完整性',
                      accuracy: '准确性',
                      consistency: '一致性',
                      timeliness: '及时性'
                    };
                    const scoreValue = typeof score === 'number' ? score : 0;
                    return (
                      <Col span={6} key={dimension}>
                        <Card size="small">
                          <Statistic
                            title={dimensionMap[dimension] || dimension}
                            value={scoreValue}
                            suffix="分"
                            valueStyle={{ 
                              color: getScoreColor(scoreValue),
                              fontSize: '24px'
                            }}
                          />
                          <Progress 
                            percent={scoreValue} 
                            strokeColor={getScoreColor(scoreValue)}
                            showInfo={false}
                            size="small"
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <BarChartOutlined />
              规则结果
            </Space>
          } 
          key="rules"
        >
          <Card title="规则检查结果" className="app-card">
            <Table
              columns={ruleColumns}
              dataSource={currentReport.ruleResults}
              rowKey="ruleId"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <WarningOutlined />
              问题列表
            </Space>
          } 
          key="issues"
        >
          <Card title="质量问题" className="app-card">
            {currentReport.issues && currentReport.issues.length > 0 ? (
              <Table
                columns={issueColumns}
                dataSource={currentReport.issues}
                rowKey={(_: any, index?: number) => `issue-${index || 0}`}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ) : (
              <Empty description="暂无质量问题" />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QualityReportPage;
