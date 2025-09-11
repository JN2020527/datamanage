import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Space,
  Button,
  Spin,
  Empty,
  Card,
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<SearchFilter>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
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
      
      // 目录筛选：若设置了 catalogKeys，则在客户端根据模拟映射过滤
      const catalogKeys = filter.catalogKeys || [];
      let afterCatalog = sortedData;
      if (catalogKeys.length) {
        // 简化规则：根据目录管理中约定的 targetTypes 过滤（若存在）
        try {
          const raw = localStorage.getItem('dap_catalog_tree_v1');
          const parsed = raw ? JSON.parse(raw) : null;
          const tree = Array.isArray(parsed) ? parsed : parsed?.tree;
          const keyToTypes = new Map<string, string[]>();
          const collect = (nodes: any[]) => nodes?.forEach(n => {
            if (n.key && Array.isArray(n.targetTypes)) keyToTypes.set(n.key, n.targetTypes);
            if (n.children?.length) collect(n.children);
          });
          if (Array.isArray(tree)) collect(tree);
          const wantedTypes = new Set<string>();
          catalogKeys.forEach(k => (keyToTypes.get(k) || []).forEach(t => wantedTypes.add(t)));
          if (wantedTypes.size > 0) {
            afterCatalog = sortedData.filter(a => wantedTypes.has(a.type as any));
          }
        } catch {}
      }

      setAssets(afterCatalog);
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
    <div className="page-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
      {/* 顶部搜索区：紧凑布局 */}
      <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: '100%', maxWidth: 800 }}>
          <AdvancedSearch
            onSearch={handleSearch}
            onSuggestionSelect={handleSearch}
            placeholder="搜索数据资产名称、描述、标签..."
            showHistory
            showPopular
            showTrending
            categories={['数据表', '数据模型', '报表', '数据集', 'API']}
            loading={loading}
            autoFocus={false}
          />
          <div style={{ marginTop: '4px' }}>
            <QuickSearchTags onTagClick={handleSearch} />
          </div>
        </div>
      </div>

      {/* 下方内容区：左筛选 + 右侧列表容器内滚动 */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Row gutter={[12, 12]} style={{ height: '100%' }}>
        <Col xs={24} lg={4} style={{ height: '100%' }}>
          <FilterPanel fullHeight filter={filter} onChange={handleFilterChange} />
        </Col>

        <Col xs={24} lg={20} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card 
            bodyStyle={{ 
              padding: 8, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              minHeight: 0 
            }} 
            style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            {/* 列表内滚动容器 */}
            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="加载中..." />
              </div>
            ) : assets.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="暂无匹配的资产" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" onClick={() => setFilter({})}>清空筛选条件</Button>
                </Empty>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <AssetList
                  assets={assets}
                  loading={loading}
                  pagination={{
                    current: pagination.page,
                    pageSize: pagination.pageSize,
                    total,
                    onChange: handlePaginationChange,
                  }}
                  summaryInfo={
                    <Text style={{ color: '#595959', fontSize: '14px' }}>
                      找到 <Text strong>{total}</Text> 个资产
                    </Text>
                  }
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
};

export default DiscoveryPage;
