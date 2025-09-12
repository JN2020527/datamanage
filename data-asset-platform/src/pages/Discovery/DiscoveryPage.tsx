import React, { useState, useEffect } from 'react';
import { Row, Col, Card, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import FilterPanel from '@components/Search/FilterPanel';
import QuickSearchTags from '@components/Search/QuickSearchTags';
import AdvancedSearch from '@components/Search/AdvancedSearch';
import AssetList from '@components/Assets/AssetList';
import { api } from '@mock/api';
import { PAGINATION_CONFIG } from '@constants/assetConfig';
import type { Asset, SearchFilter, PaginationParams } from '@types/index';
import styles from '@styles/DiscoveryPage.module.css';


const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SearchFilter>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: PAGINATION_CONFIG.defaultPageSize,
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

  const loadAssets = async () => {
    setLoading(true);
    
    try {
      const { data, total: totalCount } = await api.getAssets({
        pagination,
        filter,
      });
      
      setAssets(data);
      setTotal(totalCount || 0);
    } catch (error) {
      console.error('加载资产列表失败:', error);
      message.error('加载资产列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [filter, pagination]);

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

  return (
    <div className={styles.discoveryPage}>
      {/* 搜索区域 */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <AdvancedSearch
            onSearch={handleSearch}
            onSuggestionSelect={handleSearch}
            placeholder="搜索数据资产名称、描述、标签..."
            showHistory
            showPopular
            showTrending
            className={styles.searchBarCentered}
            loading={loading}
            autoFocus={false}
          />
          <div className={styles.quickTags}>
            <QuickSearchTags onTagClick={handleSearch} />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={styles.contentSection}>
        <Row gutter={[16, 16]} align="top" className={styles.contentRow}>
          <Col xs={24} lg={4} className={styles.filterColumn}>
            <div className={styles.filterPanel}>
              <FilterPanel filter={filter} onChange={handleFilterChange} />
            </div>
          </Col>

          <Col xs={24} lg={20} className={styles.listColumn}>
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
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DiscoveryPage;
