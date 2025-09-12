import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Tabs,
  Input,
  Select,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AssetForm from '@components/Development/AssetForm';
import TemplateManager from '@components/Development/TemplateManager';
import VersionCompare from '@components/Development/VersionCompare';
import { useNotification } from '@hooks/useNotification';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime } from '@utils/index';
import { api } from '@mock/api';
import type { Asset } from '@types/index';

const { Title, Text } = Typography;
const { Search } = Input;

const DevelopmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    // 检查URL参数，如果有edit参数则打开编辑页面
    const editId = searchParams.get('edit');
    if (editId && assets.length > 0) {
      handleEditAsset(editId);
    }
  }, [searchParams, assets]);

  const loadAssets = async () => {
    setLoading(true);
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
      setAssets([]); // 确保在错误情况下设置为空数组
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setModalVisible(true);
  };

  const handleEditAsset = async (assetId: string) => {
    try {
      const { data } = await api.getAssetDetail(assetId);
      setEditingAsset(data);
      setModalVisible(true);
    } catch (error) {
      console.error('加载资产详情失败:', error);
      showError('加载资产详情失败');
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      setAssets((prevAssets) => (prevAssets || []).filter(asset => asset.id !== assetId));
      showSuccess('资产删除成功');
    } catch (error) {
      showError('删除失败，请重试');
    }
  };

  const handleCloneAsset = async (asset: Asset) => {
    try {
      const newAsset = {
        ...asset,
        id: Date.now().toString(),
        name: `${asset.name} (副本)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAssets([newAsset, ...assets]);
      showSuccess('资产复制成功');
    } catch (error) {
      showError('复制失败，请重试');
    }
  };

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (editingAsset) {
        // 更新资产
        setAssets(assets.map(asset => 
          asset.id === editingAsset.id 
            ? { ...asset, ...assetData }
            : asset
        ));
      } else {
        // 创建新资产
        const newAsset: Asset = {
          id: Date.now().toString(),
          accessCount: 0,
          ...assetData,
        } as Asset;
        setAssets([newAsset, ...assets]);
      }
      setModalVisible(false);
      await loadAssets(); // 重新加载列表
    } catch (error) {
      throw error; // 让AssetForm处理错误
    }
  };

  const handleUseTemplate = (template: any) => {
    setEditingAsset({
      ...template,
      id: undefined, // 新建资产
      name: `基于${template.name}的新资产`,
      createdAt: undefined,
      updatedAt: undefined,
    } as any);
    setModalVisible(true);
    setActiveTab('list'); // 回到列表页面
  };

  const filteredAssets = (assets || []).filter(asset => {
    const matchesSearch = !searchText || 
      asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesType = filterType === 'all' || asset.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Asset) => (
        <Space>
          <Text strong>{text}</Text>
          {record.id === selectedAssetId && (
            <Tag color="blue">当前编辑</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeInfo = getAssetTypeInfo(type);
        return (
          <Tag color={typeInfo.color}>
            {React.createElement(typeInfo.icon)} {typeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => {
        const qualityInfo = getQualityInfo(score);
        return (
          <Tag color={qualityInfo.color}>
            {score}分
          </Tag>
        );
      },
      sorter: (a: Asset, b: Asset) => a.qualityScore - b.qualityScore,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time: string) => getRelativeTime(time),
      sorter: (a: Asset, b: Asset) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, record: Asset) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/discovery/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditAsset(record.id)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCloneAsset(record)}
            />
          </Tooltip>
          <Tooltip title="版本历史">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => {
                setSelectedAssetId(record.id);
                setActiveTab('versions');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个资产吗？"
            onConfirm={() => handleDeleteAsset(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderAssetList = () => (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          我的资产
        </Space>
      }
      extra={
        <Space>
          <Search
            placeholder="搜索资产..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="table">数据表</Select.Option>
            <Select.Option value="view">视图</Select.Option>
            <Select.Option value="api">API接口</Select.Option>
            <Select.Option value="file">文件</Select.Option>
            <Select.Option value="dashboard">仪表板</Select.Option>
            <Select.Option value="report">报表</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAsset}
          >
            创建资产
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredAssets}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
      />
    </Card>
  );

  return (
    <div className="page-container">
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/')}>首页</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>资产开发</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和统计 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '16px' }}>
          资产开发
        </Title>
        
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="我的资产"
                value={assets.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="草稿资产"
                value={(assets || []).filter(a => a.qualityScore < 60).length}
                valueStyle={{ color: '#faad14' }}
                prefix={<EditOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已发布"
                value={(assets || []).filter(a => a.qualityScore >= 80).length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均质量评分"
                value={assets.length > 0 ? Math.round(assets.reduce((sum, a) => sum + a.qualityScore, 0) / assets.length) : 0}
                suffix="分"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 主要内容区域 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: (
              <Space>
                <FileTextOutlined />
                资产列表
              </Space>
            ),
            children: renderAssetList(),
          },
          {
            key: 'templates',
            label: (
              <Space>
                <FolderOpenOutlined />
                模板管理
              </Space>
            ),
            children: <TemplateManager onSelectTemplate={handleUseTemplate} />,
          },
          {
            key: 'versions',
            label: (
              <Space>
                <HistoryOutlined />
                版本历史
              </Space>
            ),
            children: selectedAssetId ? (
              <VersionCompare 
                assetId={selectedAssetId}
                onRestore={(versionId) => {
                  showSuccess('版本恢复成功');
                  loadAssets();
                }}
              />
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  请先选择一个资产查看其版本历史
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* 资产编辑表单模态框 */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <AssetForm
          initialData={editingAsset}
          onSave={handleSaveAsset}
          onCancel={() => setModalVisible(false)}
          mode={editingAsset ? 'edit' : 'create'}
        />
      </Modal>
    </div>
  );
};

export default DevelopmentPage;
