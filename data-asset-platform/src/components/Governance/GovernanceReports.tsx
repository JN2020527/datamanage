import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Select,
  DatePicker,
  Typography,
  Table,
  Progress,
  Statistic,
  Tag,
  Tooltip,
  Divider,
  Alert,
  Tabs,
  List,
  Timeline,
  Empty,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  TrophyOutlined,
  ExclamationTriangleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  EyeOutlined,
  PrinterOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useNotification } from '@hooks/useNotification';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface GovernanceReport {
  id: string;
  name: string;
  type: 'quality' | 'compliance' | 'usage' | 'lineage' | 'standards';
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalAssets: number;
    qualityScore: number;
    complianceRate: number;
    usageRate: number;
    issuesCount: number;
  };
  insights: string[];
  recommendations: string[];
  generatedAt: string;
}

interface QualityTrend {
  date: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  overall: number;
}

interface ComplianceStatus {
  regulation: string;
  totalAssets: number;
  compliantAssets: number;
  nonCompliantAssets: number;
  complianceRate: number;
  issues: {
    severity: 'high' | 'medium' | 'low';
    count: number;
    description: string;
  }[];
}

const GovernanceReports: React.FC = () => {
  const [reports, setReports] = useState<GovernanceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GovernanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [reportType, setReportType] = useState<string>('all');
  
  const qualityChartRef = useRef<HTMLDivElement>(null);
  const complianceChartRef = useRef<HTMLDivElement>(null);
  const usageChartRef = useRef<HTMLDivElement>(null);
  
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockReports: GovernanceReport[] = [
    {
      id: '1',
      name: '数据质量月度报告',
      type: 'quality',
      period: {
        start: '2024-08-01',
        end: '2024-08-31',
      },
      metrics: {
        totalAssets: 156,
        qualityScore: 92.5,
        complianceRate: 88.7,
        usageRate: 76.3,
        issuesCount: 23,
      },
      insights: [
        '本月数据质量整体保持良好，质量分数较上月提升2.1%',
        '用户表的完整性显著改善，空值率从5.2%降至1.8%',
        '订单金额准确性检查发现12个异常案例，已全部修复',
        '新增的手机号格式验证规则有效降低了数据不一致问题',
      ],
      recommendations: [
        '建议对商品价格字段增加范围校验规则',
        '优化邮箱格式检查的正则表达式以提高准确性',
        '考虑对高价值数据表实施更频繁的质量检查',
        '建立数据质量问题的自动化告警机制',
      ],
      generatedAt: '2024-09-01 09:00:00',
    },
    {
      id: '2',
      name: '合规性检查报告',
      type: 'compliance',
      period: {
        start: '2024-08-01',
        end: '2024-08-31',
      },
      metrics: {
        totalAssets: 156,
        qualityScore: 89.2,
        complianceRate: 91.3,
        usageRate: 82.1,
        issuesCount: 8,
      },
      insights: [
        'GDPR合规性达到95.2%，较上月提升3.8%',
        '个人信息保护法相关要求基本满足，合规率89.7%',
        '数据分类标签覆盖率达到92.1%',
        '敏感数据访问权限管理符合SOX要求',
      ],
      recommendations: [
        '完善数据保留期限策略的执行',
        '加强对第三方数据共享的合规性审查',
        '建立数据删除请求的自动化处理流程',
        '定期进行数据访问权限的审计',
      ],
      generatedAt: '2024-09-01 10:30:00',
    },
  ];

  const mockQualityTrend: QualityTrend[] = Array.from({ length: 30 }, (_, i) => ({
    date: dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'),
    completeness: 90 + Math.random() * 8,
    accuracy: 88 + Math.random() * 10,
    consistency: 85 + Math.random() * 12,
    validity: 92 + Math.random() * 6,
    overall: 89 + Math.random() * 8,
  }));

  const mockComplianceStatus: ComplianceStatus[] = [
    {
      regulation: 'GDPR',
      totalAssets: 89,
      compliantAssets: 85,
      nonCompliantAssets: 4,
      complianceRate: 95.5,
      issues: [
        { severity: 'high', count: 1, description: '数据保留期限超出规定' },
        { severity: 'medium', count: 2, description: '缺少数据处理同意记录' },
        { severity: 'low', count: 1, description: '数据分类标签不完整' },
      ],
    },
    {
      regulation: '个人信息保护法',
      totalAssets: 67,
      compliantAssets: 60,
      nonCompliantAssets: 7,
      complianceRate: 89.6,
      issues: [
        { severity: 'high', count: 2, description: '敏感信息未加密存储' },
        { severity: 'medium', count: 3, description: '访问日志记录不完整' },
        { severity: 'low', count: 2, description: '用户授权记录缺失' },
      ],
    },
    {
      regulation: 'SOX',
      totalAssets: 45,
      compliantAssets: 44,
      nonCompliantAssets: 1,
      complianceRate: 97.8,
      issues: [
        { severity: 'medium', count: 1, description: '财务数据变更审计缺失' },
      ],
    },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (qualityChartRef.current) {
      initQualityChart();
    }
    if (complianceChartRef.current) {
      initComplianceChart();
    }
    if (usageChartRef.current) {
      initUsageChart();
    }
  }, [reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReports(mockReports);
      if (mockReports.length > 0) {
        setSelectedReport(mockReports[0]);
      }
    } catch (error) {
      showError('加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const initQualityChart = () => {
    if (!qualityChartRef.current) return;
    
    const chart = echarts.init(qualityChartRef.current);
    const option: EChartsOption = {
      title: {
        text: '数据质量趋势',
        left: 'center',
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        bottom: 0,
        data: ['完整性', '准确性', '一致性', '有效性', '综合分数'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: mockQualityTrend.map(item => item.date.split('-').slice(1).join('/')),
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        min: 80,
        max: 100,
        axisLabel: { formatter: '{value}%' },
      },
      series: [
        {
          name: '完整性',
          type: 'line',
          data: mockQualityTrend.map(item => item.completeness.toFixed(1)),
          smooth: true,
          lineStyle: { color: '#1890ff' },
        },
        {
          name: '准确性',
          type: 'line',
          data: mockQualityTrend.map(item => item.accuracy.toFixed(1)),
          smooth: true,
          lineStyle: { color: '#52c41a' },
        },
        {
          name: '一致性',
          type: 'line',
          data: mockQualityTrend.map(item => item.consistency.toFixed(1)),
          smooth: true,
          lineStyle: { color: '#faad14' },
        },
        {
          name: '有效性',
          type: 'line',
          data: mockQualityTrend.map(item => item.validity.toFixed(1)),
          smooth: true,
          lineStyle: { color: '#722ed1' },
        },
        {
          name: '综合分数',
          type: 'line',
          data: mockQualityTrend.map(item => item.overall.toFixed(1)),
          smooth: true,
          lineStyle: { color: '#f5222d', width: 3 },
        },
      ],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  };

  const initComplianceChart = () => {
    if (!complianceChartRef.current) return;
    
    const chart = echarts.init(complianceChartRef.current);
    const option: EChartsOption = {
      title: {
        text: '合规性状态',
        left: 'center',
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        bottom: 0,
        data: ['合规资产', '不合规资产'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: mockComplianceStatus.map(item => item.regulation),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '合规资产',
          type: 'bar',
          stack: 'total',
          data: mockComplianceStatus.map(item => item.compliantAssets),
          itemStyle: { color: '#52c41a' },
        },
        {
          name: '不合规资产',
          type: 'bar',
          stack: 'total',
          data: mockComplianceStatus.map(item => item.nonCompliantAssets),
          itemStyle: { color: '#ff4d4f' },
        },
      ],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  };

  const initUsageChart = () => {
    if (!usageChartRef.current) return;
    
    const chart = echarts.init(usageChartRef.current);
    const data = [
      { name: '高频使用', value: 45 },
      { name: '中频使用', value: 67 },
      { name: '低频使用', value: 32 },
      { name: '未使用', value: 12 },
    ];

    const option: EChartsOption = {
      title: {
        text: '数据资产使用分布',
        left: 'center',
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        bottom: 0,
        data: data.map(item => item.name),
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '45%'],
          data,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  };

  const handleExportReport = () => {
    showSuccess('报告导出成功');
  };

  const handleShareReport = () => {
    showSuccess('报告分享成功');
  };

  const handleGenerateReport = () => {
    showSuccess('报告生成中...');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return severity;
    }
  };

  const complianceColumns = [
    {
      title: '法规名称',
      dataIndex: 'regulation',
      key: 'regulation',
    },
    {
      title: '总资产数',
      dataIndex: 'totalAssets',
      key: 'totalAssets',
    },
    {
      title: '合规资产',
      dataIndex: 'compliantAssets',
      key: 'compliantAssets',
      render: (value: number) => <Text style={{ color: '#52c41a' }}>{value}</Text>,
    },
    {
      title: '不合规资产',
      dataIndex: 'nonCompliantAssets',
      key: 'nonCompliantAssets',
      render: (value: number) => <Text style={{ color: '#ff4d4f' }}>{value}</Text>,
    },
    {
      title: '合规率',
      dataIndex: 'complianceRate',
      key: 'complianceRate',
      render: (value: number) => (
        <Space>
          <Progress
            percent={value}
            size="small"
            status={value > 90 ? 'success' : value > 80 ? 'active' : 'exception'}
          />
          <Text>{value.toFixed(1)}%</Text>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> 治理报告
          </Title>
          <Text type="secondary">
            生成和查看数据治理相关的各类报告和分析
          </Text>
        </Col>
        <Col>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 120 }}
            >
              <Select.Option value="all">全部类型</Select.Option>
              <Select.Option value="quality">数据质量</Select.Option>
              <Select.Option value="compliance">合规性</Select.Option>
              <Select.Option value="usage">使用情况</Select.Option>
            </Select>
            <Button type="primary" onClick={handleGenerateReport}>
              生成报告
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总资产数"
              value={156}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质量分数"
              value={92.5}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合规率"
              value={88.7}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="问题数量"
              value={23}
              prefix={<ExclamationTriangleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Tabs
              items={[
                {
                  key: 'overview',
                  label: '概览仪表板',
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Card>
                          <div ref={qualityChartRef} style={{ height: '300px' }} />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card>
                          <div ref={complianceChartRef} style={{ height: '300px' }} />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card>
                          <div ref={usageChartRef} style={{ height: '300px' }} />
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'quality',
                  label: '质量报告',
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card title="质量洞察" size="small">
                          <List
                            size="small"
                            dataSource={selectedReport?.insights || []}
                            renderItem={item => (
                              <List.Item>
                                <Space>
                                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                  <Text>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="改进建议" size="small">
                          <List
                            size="small"
                            dataSource={selectedReport?.recommendations || []}
                            renderItem={item => (
                              <List.Item>
                                <Space>
                                  <FireOutlined style={{ color: '#faad14' }} />
                                  <Text>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'compliance',
                  label: '合规报告',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Table
                        columns={complianceColumns}
                        dataSource={mockComplianceStatus}
                        rowKey="regulation"
                        pagination={false}
                        size="small"
                      />
                      
                      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        {mockComplianceStatus.map(status => (
                          <Col span={8} key={status.regulation}>
                            <Card title={`${status.regulation} 问题详情`} size="small">
                              <List
                                size="small"
                                dataSource={status.issues}
                                renderItem={issue => (
                                  <List.Item>
                                    <Space>
                                      <Tag color={getSeverityColor(issue.severity)}>
                                        {getSeverityText(issue.severity)}
                                      </Tag>
                                      <Text>{issue.description}</Text>
                                      <Badge count={issue.count} />
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Space>
                  ),
                },
                {
                  key: 'history',
                  label: '历史报告',
                  children: (
                    <List
                      dataSource={reports}
                      renderItem={report => (
                        <List.Item
                          actions={[
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() => setSelectedReport(report)}
                            >
                              查看
                            </Button>,
                            <Button
                              type="text"
                              icon={<DownloadOutlined />}
                              onClick={handleExportReport}
                            >
                              导出
                            </Button>,
                            <Button
                              type="text"
                              icon={<ShareAltOutlined />}
                              onClick={handleShareReport}
                            >
                              分享
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{report.name}</Text>
                                <Tag color="blue">{report.type}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Text type="secondary">
                                  报告期间: {report.period.start} 至 {report.period.end}
                                </Text>
                                <Space>
                                  <Text>质量分数: {report.metrics.qualityScore}%</Text>
                                  <Text>合规率: {report.metrics.complianceRate}%</Text>
                                  <Text>问题数: {report.metrics.issuesCount}</Text>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ),
                },
              ]}
              tabBarExtraContent={
                selectedReport && (
                  <Space>
                    <Button icon={<PrinterOutlined />}>打印</Button>
                    <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
                      导出PDF
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShareReport}>
                      分享
                    </Button>
                  </Space>
                )
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GovernanceReports;
