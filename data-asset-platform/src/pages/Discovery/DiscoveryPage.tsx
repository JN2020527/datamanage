import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Space,
  Button,
  Radio,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import SearchInput from '@components/Search/SearchInput';
import FilterPanel from '@components/Search/FilterPanel';
import QuickSearchTags from '@components/Search/QuickSearchTags';
import AdvancedSearch from '@components/Search/AdvancedSearch';
import SearchHighlight from '@components/Search/SearchHighlight';
import AssetCard from '@components/Assets/AssetCard';
import AssetList from '@components/Assets/AssetList';
import AssetCardSkeleton from '@components/Loading/AssetCardSkeleton';
import { api } from '@mock/api';
import type { Asset, SearchFilter, PaginationParams } from '@types/index';

const { Title, Text } = Typography;

type ViewMode = 'card' | 'list';
type SortOrder = 'asc' | 'desc';
type SortField = 'name' | 'updatedAt' | 'qualityScore' | 'accessCount';

const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<SearchFilter>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
  });
  const [total, setTotal] = useState(0);

  // 从URL参数初始化筛选条件
  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    
    setFilter({
      keyword: keyword || undefined,
      assetTypes: type ? [type as any] : undefined,
      departments: department ? [department] : undefined,
    });
  }, [searchParams]);

  const loadAssets = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const { data, total: totalCount } = await api.getAssets({
        pagination,
        filter,
      });
      
      // 客户端排序
      const sortedData = [...data].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];
        
        if (sortField === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (typeof aValue === 'string') {
          const result = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? result : -result;
        }
        
        const result = aValue - bValue;
        return sortOrder === 'asc' ? result : -result;
      });
      
      setAssets(sortedData);
      setTotal(totalCount || 0);
    } catch (error) {
      console.error('加载资产列表失败:', error);
      message.error('加载资产列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAssets();
  }, [filter, pagination, sortField, sortOrder]);

  const handleSearch = (keyword: string) => {
    setFilter(prev => ({ ...prev, keyword }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // 更新URL参数
    const newParams = new URLSearchParams(searchParams);
    if (keyword) {
      newParams.set('keyword', keyword);
    } else {
      newParams.delete('keyword');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRefresh = () => {
    loadAssets(true);
  };

  const handleAdvancedSearch = () => {
    message.info('高级搜索功能开发中...');
  };

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      type={sortField === field ? 'primary' : 'default'}
      size="small"
      onClick={() => handleSortChange(field)}
      icon={
        sortField === field ? (
          sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
        ) : (
          <SortAscendingOutlined />
        )
      }
    >
      {label}
    </Button>
  );

  return (
    <div className="page-container">
      {/* 页面标题 */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">
              资产发现
            </Title>
            <Text className="page-description">
              搜索和浏览您的数据资产，发现有价值的数据
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
          </Space>
        </div>
      </div>

      {/* 搜索区域 */}
      <div style={{ marginBottom: '24px' }}>
        <AdvancedSearch
          onSearch={handleSearch}
          onSuggestionSelect={handleSearch}
          placeholder="搜索数据资产名称、描述、标签..."
          showHistory={true}
          showPopular={true}
          showTrending={true}
          categories={['数据表', '数据模型', '报表', '数据集', 'API']}
          loading={loading}
          autoFocus={false}
          className="mb-4"
        />
        <QuickSearchTags onTagClick={handleSearch} />
      </div>

      <Row gutter={[24, 24]}>
        {/* 筛选面板 */}
        <Col xs={24} lg={6}>
          <FilterPanel
            filter={filter}
            onChange={handleFilterChange}
          />
        </Col>

        {/* 主内容区 */}
        <Col xs={24} lg={18}>
          {/* 工具栏 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <Text style={{ marginRight: '16px' }}>
                找到 <Text strong>{total}</Text> 个资产
              </Text>
              
              <Space>
                {renderSortButton('updatedAt', '更新时间')}
                {renderSortButton('qualityScore', '质量评分')}
                {renderSortButton('accessCount', '访问量')}
                {renderSortButton('name', '名称')}
              </Space>
            </div>

            <Space>
              <Text>视图:</Text>
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                size="small"
              >
                <Radio.Button value="card">
                  <AppstoreOutlined /> 卡片
                </Radio.Button>
                <Radio.Button value="list">
                  <BarsOutlined /> 列表
                </Radio.Button>
              </Radio.Group>
            </Space>
          </div>

          {/* 资产展示区域 */}
          {loading ? (
            viewMode === 'card' ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }, (_, index) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                    <AssetCardSkeleton count={1} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Spin size="large" tip="加载中..." spinning={true}>
                <div style={{ textAlign: 'center', padding: '60px', minHeight: '200px' }}>
                </div>
              </Spin>
            )
          ) : assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Empty
                description="暂无匹配的资产"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => setFilter({})}>
                  清空筛选条件
                </Button>
              </Empty>
            </div>
          ) : viewMode === 'card' ? (
            <>
              <Row gutter={[16, 16]}>
                {assets?.map((asset) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={asset.id}>
                    <AssetCard asset={asset} />
                  </Col>
                )) || []}
              </Row>
              
              {/* 卡片视图分页 */}
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setPagination(prev => ({ ...prev, pageSize: prev.pageSize + 20 }))}
                  loading={loading}
                  disabled={assets.length >= total}
                >
                  {assets.length >= total ? '已加载全部' : '加载更多'}
                </Button>
              </div>
            </>
          ) : (
            <AssetList
              assets={assets}
              loading={loading}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total,
                onChange: handlePaginationChange,
              }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DiscoveryPage;
