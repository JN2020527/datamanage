import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  DatePicker,
  Tabs,
  Avatar,
  Progress,
  Empty,
  Tooltip,
  Popconfirm,
  Modal,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  TableOutlined,
  DashboardOutlined,
  TagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '@hooks/useNotification';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime } from '@utils/index';
import { api } from '@mock/api';
import AssetForm from '@components/Development/AssetForm';
import MetricForm from '@components/Development/MetricForm';
import TagForm from '@components/Development/TagForm';
import type { Asset } from '@types/index';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 资产状态配置
const ASSET_STATUS_CONFIG = {
  draft: { label: '草稿', color: '#8c8c8c', icon: <EditOutlined /> },
  developing: { label: '开发中', color: '#1890ff', icon: <SyncOutlined spin /> },
  pending: { label: '待审核', color: '#faad14', icon: <ExclamationCircleOutlined /> },
  published: { label: '已发布', color: '#52c41a', icon: <CheckCircleOutlined /> },
  offline: { label: '已下线', color: '#f5222d', icon: <ClockCircleOutlined /> },
};

const MyAssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    draft: 0,
    developing: 0,
    pending: 0,
    published: 0,
    offline: 0,
  });

  // 加载用户资产数据
  const loadMyAssets = async () => {
    setLoading(true);
    try {
      const response = await api.getMyAssets();
      if (response.success && response.data) {
        setAssets(response.data);
        calculateStatistics(response.data);
      }
    } catch (error) {
      console.error('加载我的资产失败:', error);
      showError('加载资产数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStatistics = (assetList: Asset[]) => {
    const stats = {
      total: assetList.length,
      draft: assetList.filter(a => a.status === 'draft').length,
      developing: assetList.filter(a => a.status === 'developing').length,
      pending: assetList.filter(a => a.status === 'pending').length,
      published: assetList.filter(a => a.status === 'published').length,
      offline: assetList.filter(a => a.status === 'offline').length,
    };
    setStatistics(stats);
  };

  useEffect(() => {
    loadMyAssets();
  }, []);

  // 创建新资产
  const handleCreateAsset = (assetType: string = 'table') => {
    setEditingAsset({ type: assetType as 'table' | 'metric' | 'tag' } as Asset);
    setModalVisible(true);
  };

  // 编辑资产
  const handleEditAsset = (assetId: string) => {
    navigate(`/development?edit=${assetId}`);
  };

  // 查看资产详情
  const handleViewAsset = (assetId: string) => {
    navigate(`/discovery/${assetId}`);
  };

  // 复制资产
  const handleCloneAsset = async (asset: Asset) => {
    try {
      const newAsset = {
        ...asset,
        id: undefined,
        name: `${asset.name}_副本`,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.createAsset(newAsset);
      if (response.success) {
        showSuccess('资产复制成功');
        loadMyAssets();
      }
    } catch (error) {
      showError('复制失败，请重试');
    }
  };

  // 删除资产
  const handleDeleteAsset = async (assetId: string) => {
    try {
      setAssets(assets.filter(asset => asset.id !== assetId));
      showSuccess('资产删除成功');
    } catch (error) {
      showError('删除失败，请重试');
    }
  };

  // 保存资产
  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (editingAsset?.id) {
        // 更新资产
        const response = await api.updateAsset(editingAsset.id, assetData);
        if (response.success) {
          setAssets(assets.map(asset => 
            asset.id === editingAsset.id ? { ...asset, ...assetData } : asset
          ));
          showSuccess('资产更新成功');
        }
      } else {
        // 创建新资产
        const response = await api.createAsset({
          ...assetData,
          id: `asset-${Date.now()}`,
          status: 'draft',
          owner: '当前用户',
        });
        if (response.success) {
          loadMyAssets(); // 重新加载资产列表
          showSuccess('资产创建成功');
        }
      }
      setModalVisible(false);
      setEditingAsset(null);
    } catch (error) {
      showError('保存失败，请重试');
    }
  };

  // 根据资产类型渲染不同的表单组件
  const renderAssetForm = () => {
    const assetType = editingAsset?.type || 'table';
    const commonProps = {
      initialData: editingAsset,
      onSave: handleSaveAsset,
      onCancel: () => {
        setModalVisible(false);
        setEditingAsset(null);
      },
      mode: editingAsset?.id ? 'edit' : 'create' as 'create' | 'edit',
    };

    switch (assetType) {
      case 'metric':
        return <MetricForm {...commonProps} />;
      case 'tag':
        return <TagForm {...commonProps} />;
      case 'table':
      default:
        return <AssetForm {...commonProps} />;
    }
  };

  // 过滤资产数据
  const filteredAssets = assets.filter(asset => {
    const matchSearch = !searchText || 
      asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchType = selectedType === 'all' || asset.type === selectedType;
    
    return matchSearch && matchStatus && matchType;
  });

  // 表格列配置
  const columns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Asset) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {React.createElement(getAssetTypeInfo(record.type).icon, {
            style: { marginRight: 8, color: getAssetTypeInfo(record.type).color }
          })}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeInfo = getAssetTypeInfo(type);
        const hexToRgba = (hex: string, alpha: number) => {
          const normalized = hex.replace('#', '');
          const r = parseInt(normalized.substring(0, 2), 16);
          const g = parseInt(normalized.substring(2, 4), 16);
          const b = parseInt(normalized.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        return (
          <Tag
            style={{
              backgroundColor: hexToRgba(typeInfo.color, 0.12),
              color: typeInfo.color,
              borderColor: typeInfo.color,
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 4,
            }}
          >
            {typeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = ASSET_STATUS_CONFIG[status as keyof typeof ASSET_STATUS_CONFIG];
        const hexToRgba = (hex: string, alpha: number) => {
          const normalized = hex.replace('#', '');
          const r = parseInt(normalized.substring(0, 2), 16);
          const g = parseInt(normalized.substring(2, 4), 16);
          const b = parseInt(normalized.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        return (
          <Tag
            icon={statusConfig.icon}
            style={{
              backgroundColor: hexToRgba(statusConfig.color, 0.12),
              color: statusConfig.color,
              borderColor: statusConfig.color,
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 4,
            }}
          >
            {statusConfig.label}
          </Tag>
        );
      },
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 120,
      render: (score: number) => {
        const qualityInfo = getQualityInfo(score);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Progress
              percent={score}
              size="small"
              strokeColor={qualityInfo.color}
              showInfo={false}
              style={{ width: '60px', marginRight: '8px' }}
            />
            <Text style={{ color: qualityInfo.color, fontSize: '12px' }}>
              {score}分
            </Text>
          </div>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text type="secondary">{getRelativeTime(date)}</Text>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record: Asset) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewAsset(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditAsset(record.id)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCloneAsset(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个资产吗？"
              onConfirm={() => handleDeleteAsset(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          我的资产
        </Title>
        <Text type="secondary">管理和查看您创建的所有数据资产</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="总资产"
              value={statistics.total}
              prefix={<TableOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="开发中"
              value={statistics.developing}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="待审核"
              value={statistics.pending}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="已发布"
              value={statistics.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="草稿"
              value={statistics.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Statistic
              title="已下线"
              value={statistics.offline}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 资产列表 */}
      <Card>
        {/* 工具栏 */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Space size="middle" wrap>
            <Search
              placeholder="搜索资产名称或描述"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 120 }}
              placeholder="状态筛选"
            >
              <Option value="all">全部状态</Option>
              <Option value="draft">草稿</Option>
              <Option value="developing">开发中</Option>
              <Option value="pending">待审核</Option>
              <Option value="published">已发布</Option>
              <Option value="offline">已下线</Option>
            </Select>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 120 }}
              placeholder="类型筛选"
            >
              <Option value="all">全部类型</Option>
              <Option value="table">数据表</Option>
              <Option value="metric">指标</Option>
              <Option value="tag">标签</Option>
            </Select>
          </Space>
          
          <Dropdown
            menu={{
              items: [
                {
                  key: 'table',
                  icon: <TableOutlined />,
                  label: '创建数据表',
                  onClick: () => handleCreateAsset('table'),
                },
                {
                  key: 'metric',
                  icon: <DashboardOutlined />,
                  label: '创建指标',
                  onClick: () => handleCreateAsset('metric'),
                },
                {
                  key: 'tag',
                  icon: <TagOutlined />,
                  label: '创建标签',
                  onClick: () => handleCreateAsset('tag'),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              创建资产 <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        {/* 资产表格 */}
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredAssets.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    暂无资产数据
                    <br />
                    <Button type="link" onClick={() => handleCreateAsset('table')}>
                      立即创建
                    </Button>
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      {/* 创建/编辑资产模态框 */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAsset(null);
        }}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {renderAssetForm()}
      </Modal>
    </div>
  );
};

export default MyAssetsPage;
