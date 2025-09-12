import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Input, 
  Dropdown, 
  Space, 
  Button, 
  Spin
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  DownOutlined
} from '@ant-design/icons';
import { searchHistory } from '../../utils/searchHistory';


interface AdvancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string, filters?: any) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  showHistory?: boolean;
  showPopular?: boolean;
  showTrending?: boolean;
  categories?: string[];
  loading?: boolean;
  autoFocus?: boolean;
}


const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = '搜索数据资产...',
  onSearch,
  onSuggestionSelect,
  className = '',
  size = 'large',
  showHistory = true,
  showPopular = true,
  showTrending = true,
  categories = [],
  loading = false,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const inputRef = useRef<any>(null);


  // 处理输入变化
  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  // 处理搜索
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // 添加到搜索历史
    searchHistory.addSearchHistory(finalQuery, 'search', undefined, selectedCategory);
    
    // 触发搜索回调
    onSearch?.(finalQuery, { category: selectedCategory });
  };


  // 键盘导航（简化版）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 只处理Enter键进行搜索
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 清除搜索
  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };


  // 分类菜单
  const categoryMenu = {
    items: [
      {
        key: '',
        label: '全部分类',
        icon: <SearchOutlined />
      },
      ...categories.map(category => ({
        key: category,
        label: category,
        icon: <FilterOutlined />
      }))
    ],
    onClick: ({ key }: { key: string }) => {
      setSelectedCategory(key);
    }
  };


  // 自动焦点
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* 分类选择器 */}
        {categories.length > 0 && (
          <Dropdown menu={categoryMenu} trigger={['click']}>
            <Button className="flex items-center gap-1">
              <FilterOutlined />
              {selectedCategory || '分类'}
              <DownOutlined />
            </Button>
          </Dropdown>
        )}

        {/* 搜索输入框 */}
        <div className="relative search-input-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Input
            ref={inputRef}
            size={size}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPressEnter={() => handleSearch()}
            onFocus={() => {
              // 不再显示建议下拉菜单
            }}
            onBlur={() => {
              // 不需要处理下拉菜单
            }}
            placeholder={placeholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            suffix={
              <Space>
                {loading && <Spin size="small" />}
                {query && (
                  <Button
                    type="text"
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                  />
                )}
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSearch()}
                  className="search-button"
                >
                  搜索
                </Button>
              </Space>
            }
            className="search-input"
            style={{ width: '100%' }}
          />

          {/* 建议下拉菜单已移除 */}
        </div>

      </div>
    </div>
  );
};

export default AdvancedSearch;
