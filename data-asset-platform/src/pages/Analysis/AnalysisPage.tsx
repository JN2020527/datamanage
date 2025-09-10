import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Button,
  Space,
  Select,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
} from 'antd';
import {
  BarChartOutlined,
  TableOutlined,
  DesktopOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataPreview from '@components/Analysis/DataPreview';
import ChartAnalysis from '@components/Analysis/ChartAnalysis';
import ReportDesigner from '@components/Analysis/ReportDesigner';
import { useNotification } from '@hooks/useNotification';
import { api } from '@mock/api';
import type { Asset } from '@types/index';

const { Title, Text } = Typography;

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    // 检查URL参数，如果指定了资产ID
    const assetId = searchParams.get('asset');
    if (assetId) {
      setSelectedAsset(assetId);
    }
  }, [searchParams, assets]);

  useEffect(() => {
    if (selectedAsset) {
      loadAnalysisData(selectedAsset);
    } else {
      // 清空上一次的分析数据，确保渲染安全
      setAnalysisData([]);
      setColumns([]);
    }
  }, [selectedAsset]);

  const loadAssets = async () => {
    try {
      const { data } = await api.getAssets({
        page: 1,
        pageSize: 100,
        search: '',
        filter: {},
        sort: 'updatedAt_desc',
      });
      setAssets(data?.items || []);
    } catch (error) {
      console.error('加载资产列表失败:', error);
      showError('加载资产列表失败');
      setAssets([]);
    }
  };

  const loadAnalysisData = async (assetId: string) => {
    setLoading(true);
    try {
      // 模拟加载分析数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据和列定义
      const mockAnalysisData = Array.from({ length: 500 }, (_, index) => ({
        id: index + 1,
        date: new Date(2024, 0, 1 + (index % 365)).toISOString().split('T')[0],
        sales: 1000 + Math.random() * 5000,
        orders: 10 + Math.random() * 100,
        users: 50 + Math.random() * 200,
        conversion: (Math.random() * 0.1 + 0.02).toFixed(3),
        region: ['北京', '上海', '广州', '深圳', '杭州'][index % 5],
        category: ['电子产品', '服装', '食品', '图书', '家居'][index % 5],
      }));

      const mockColumns = [
        { key: 'id', name: 'ID', type: 'number' },
        { key: 'date', name: '日期', type: 'date' },
        { key: 'sales', name: '销售额', type: 'number' },
        { key: 'orders', name: '订单数', type: 'number' },
        { key: 'users', name: '用户数', type: 'number' },
        { key: 'conversion', name: '转化率', type: 'number' },
        { key: 'region', name: '地区', type: 'string' },
        { key: 'category', name: '类别', type: 'string' },
      ];

      setAnalysisData(mockAnalysisData);
      setColumns(mockColumns);
    } catch (error) {
      showError('加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChart = (data: any[], config: any) => {
    // 创建图表后切换到图表分析页面
    setActiveTab('charts');
    showSuccess('图表创建成功');
  };

  const handleSaveReport = (report: any) => {
    console.log('保存报表:', report);
    showSuccess('报表保存成功');
  };

  const handleExportData = () => {
    if (!analysisData.length) {
      showError('没有可导出的数据');
      return;
    }
    
    const csvContent = generateCSV(analysisData, columns);
    downloadCSV(csvContent, `analysis_data_${Date.now()}.csv`);
    showSuccess('数据导出成功');
  };

  const generateCSV = (data: any[] = [], columns: any[] = []) => {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeData = Array.isArray(data) ? data : [];

    const headers = safeColumns.map(col => col?.name ?? '').join(',');
    const rows = safeData
      .map(row => safeColumns.map(col => (row?.[col?.key] ?? '')).join(','))
      .join('\n');
    return `${headers}\n${rows}`;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (!selectedAsset) {
      return (
        <Card>
          <Empty
            description="请选择要分析的数据资产"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/discovery')}>
              去选择资产
            </Button>
          </Empty>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" tip="加载分析数据中..." />
          </div>
        </Card>
      );
    }

    switch (activeTab) {
      case 'preview':
        return (
          <DataPreview
            assetId={selectedAsset}
            onCreateChart={handleCreateChart}
          />
        );
      case 'charts':
        return (
          <ChartAnalysis
            data={analysisData}
            columns={columns}
          />
        );
      case 'reports':
        return (
          <ReportDesigner
            onSave={handleSaveReport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/')}>首页</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>敏捷分析</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              敏捷分析
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="选择数据资产"
                value={selectedAsset}
                onChange={setSelectedAsset}
                style={{ width: 300 }}
                showSearch
                optionFilterProp="children"
              >
                {(assets || []).map(asset => (
                  <Select.Option key={asset.id} value={asset.id}>
                    <Space>
                      <FileTextOutlined />
                      {asset.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
              {selectedAsset && (
                <>
                  <Button icon={<DownloadOutlined />} onClick={handleExportData}>
                    导出数据
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    分享分析
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* 统计信息 */}
      {selectedAsset && !loading && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="数据行数"
                value={analysisData.length}
                prefix={<TableOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="字段数量"
                value={columns.length}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="数值字段"
                value={(columns || []).filter(col => col.type === 'number').length}
                prefix={<PieChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="文本字段"
                value={(columns || []).filter(col => col.type === 'string').length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主要内容区域 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'preview',
            label: (
              <Space>
                <TableOutlined />
                数据预览
              </Space>
            ),
            children: renderContent(),
          },
          {
            key: 'charts',
            label: (
              <Space>
                <BarChartOutlined />
                图表分析
              </Space>
            ),
            children: renderContent(),
            disabled: !selectedAsset,
          },
          {
            key: 'reports',
            label: (
              <Space>
                <DesktopOutlined />
                报表设计
              </Space>
            ),
            children: renderContent(),
            disabled: !selectedAsset,
          },
        ]}
      />
    </div>
  );
};

export default AnalysisPage;
