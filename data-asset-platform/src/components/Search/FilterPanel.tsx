import React, { useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Button, Space, Badge } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import type { SearchFilter } from '@types/index';
import styles from '@styles/DiscoveryPage.module.css';


interface FilterPanelProps {
  filter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
  collapsed?: boolean;
  fullHeight?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onChange,
  collapsed = false,
  fullHeight = false,
}) => {
  const [catalogTree, setCatalogTree] = useState<any[]>([]);

  useEffect(() => {
    // 读取目录管理本地配置
    try {
      const raw = localStorage.getItem('dap_catalog_tree_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const tree = Array.isArray(parsed) ? parsed : parsed?.tree;
        if (Array.isArray(tree)) setCatalogTree(tree);
      }
    } catch (error) {
      console.error('读取目录配置失败:', error);
    }
  }, []);


  const handleClearAll = () => {
    onChange({
      keyword: filter.keyword, // 保留搜索关键词
    });
  };

  // 计算当前筛选条件数量
  const filterCount = useMemo(() => {
    return filter.catalogKeys?.length || 0;
  }, [filter.catalogKeys]);

  const catalogGroups = useMemo(() => {
    const groups: Array<{ title: string; options: Array<{ label: string; value: string }> }> = [];
    const visit = (nodes: any[], parentTitle?: string) => {
      nodes?.forEach(n => {
        if (n.type === 'folder' && n.children?.length) {
          const options = n.children
            .filter((c: any) => c.visible !== false)
            .map((c: any) => ({ label: c.title, value: c.key }));
          if (options.length) groups.push({ title: n.title, options });
        } else if (n.children?.length) {
          visit(n.children, n.title);
        }
      });
    };
    visit(catalogTree);
    return groups;
  }, [catalogTree]);

  const handleCatalogChange = (checkedValues: string[]) => {
    onChange({
      ...filter,
      catalogKeys: checkedValues,
    });
  };

  if (collapsed) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Badge count={filterCount} offset={[8, 0]}>
          <Button type="text" icon={<ClearOutlined />} disabled>
            筛选条件
          </Button>
        </Badge>
      </div>
    );
  }

  return (
    <div className={styles.filterPanel}>
      {/* 筛选条件 */}
      {catalogGroups.length > 0 ? (
        <Card
          title="筛选"
          size="small"
          extra={
            filter.catalogKeys?.length ? (
              <Button 
                type="link" 
                size="small" 
                onClick={() => onChange({ ...filter, catalogKeys: [] })}
              >
                清空
              </Button>
            ) : null
          }
          style={{ width: '100%' }}
        >
          {catalogGroups.map(group => (
            <div key={group.title} className={styles.catalogGroup}>
              <div className={styles.catalogGroupTitle}>
                {group.title}
              </div>
              <Checkbox.Group
                value={filter.catalogKeys || []}
                onChange={handleCatalogChange}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {group.options.map(op => (
                    <Checkbox 
                      key={op.value} 
                      value={op.value}
                      className={styles.catalogOption}
                    >
                      <span className={styles.catalogOptionLabel}>
                        {op.label}
                      </span>
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </div>
          ))}
          
          {/* 清空筛选按钮 */}
          {filter.catalogKeys?.length > 0 && (
            <div className={styles.clearButton}>
              <Button 
                block 
                icon={<ClearOutlined />} 
                onClick={handleClearAll}
                size="small"
              >
                清空筛选 ({filter.catalogKeys.length})
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card
          title="筛选"
          size="small"
          style={{ width: '100%' }}
        >
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📁</div>
            <div>请先在系统管理中配置目录</div>
            <div className={styles.emptyStateHint}>
              系统管理 → 目录管理
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FilterPanel;
