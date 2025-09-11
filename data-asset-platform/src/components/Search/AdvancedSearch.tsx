import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Input, 
  AutoComplete, 
  Dropdown, 
  Space, 
  Tag, 
  Button, 
  Typography, 
  Divider,
  Empty,
  Tooltip,
  Spin,
  Badge
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  FilterOutlined,
  ClearOutlined,
  HistoryOutlined,
  StarOutlined,
  DeleteOutlined,
  DownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { searchHistory } from '../../utils/searchHistory';
import type { SearchHistoryItem, PopularSearchItem } from '../../utils/searchHistory';
import { debounce } from '../../utils/index';

const { Text, Title } = Typography;

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

interface SearchSuggestion {
  value: string;
  label: React.ReactNode;
  type: 'history' | 'popular' | 'trending' | 'suggestion';
  category?: string;
  count?: number;
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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchStats, setSearchStats] = useState<any>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 生成搜索建议
  const generateSuggestions = useCallback((searchQuery: string) => {
    const suggestions: SearchSuggestion[] = [];
    
    if (!searchQuery.trim()) {
      // 空查询时显示历史记录和热门搜索
      if (showHistory) {
        const recentSearches = searchHistory.getRecentSearches(5);
        recentSearches.forEach(item => {
          suggestions.push({
            value: item.query,
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-gray-400" />
                  <Text>{item.query}</Text>
                  {item.category && (
                    <Tag size="small" color="blue">{item.category}</Tag>
                  )}
                </div>
                <Text type="secondary" className="text-xs">
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </div>
            ),
            type: 'history',
            category: item.category
          });
        });
      }

      if (showPopular) {
        const popularSearches = searchHistory.getPopularSearches(5);
        popularSearches.forEach(item => {
          suggestions.push({
            value: item.query,
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FireOutlined className="text-orange-500" />
                  <Text>{item.query}</Text>
                  {item.category && (
                    <Tag size="small" color="orange">{item.category}</Tag>
                  )}
                </div>
                <Badge count={item.count} size="small" />
              </div>
            ),
            type: 'popular',
            category: item.category,
            count: item.count
          });
        });
      }

      if (showTrending) {
        const trendingSearches = searchHistory.getTrendingSearches(3);
        trendingSearches.forEach(item => {
          suggestions.push({
            value: item.query,
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <RiseOutlined className="text-green-500" />
                  <Text>{item.query}</Text>
                  <Tag size="small" color="green">热门</Tag>
                  {item.category && (
                    <Tag size="small" color="purple">{item.category}</Tag>
                  )}
                </div>
                <Badge count={item.count} size="small" />
              </div>
            ),
            type: 'trending',
            category: item.category,
            count: item.count
          });
        });
      }
    } else {
      // 有查询内容时显示匹配的建议
      const searchSuggestions = searchHistory.getSearchSuggestions(searchQuery, 6);
      searchSuggestions.forEach(suggestion => {
        // 高亮匹配文本
        const highlightedText = highlightText(suggestion, searchQuery);
        suggestions.push({
          value: suggestion,
          label: (
            <div className="flex items-center gap-2">
              <SearchOutlined className="text-blue-500" />
              <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
            </div>
          ),
          type: 'suggestion'
        });
      });

      // 添加历史记录中的匹配项
      const historyMatches = searchHistory.getSearchHistory(20)
        .filter(item => item.query.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3);
      
      historyMatches.forEach(item => {
        const highlightedText = highlightText(item.query, searchQuery);
        suggestions.push({
          value: item.query,
          label: (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <HistoryOutlined className="text-gray-400" />
                <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
                {item.category && (
                  <Tag size="small" color="blue">{item.category}</Tag>
                )}
              </div>
              <Text type="secondary" className="text-xs">历史</Text>
            </div>
          ),
          type: 'history',
          category: item.category
        });
      });
    }

    return suggestions;
  }, [showHistory, showPopular, showTrending]);

  // 高亮匹配文本
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // 防抖的建议生成
  const debouncedGenerateSuggestions = useCallback(
    debounce((searchQuery: string) => {
      const newSuggestions = generateSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    }, 200),
    [generateSuggestions]
  );

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setQuery(value);
    setHighlightedIndex(-1);
    debouncedGenerateSuggestions(value);
  };

  // 处理搜索
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // 添加到搜索历史
    searchHistory.addSearchHistory(finalQuery, 'search', undefined, selectedCategory);
    
    // 触发搜索回调
    onSearch?.(finalQuery, { category: selectedCategory });
    
    // 关闭下拉菜单
    setIsDropdownOpen(false);
    
    // 更新统计信息
    updateSearchStats();
  };

  // 处理建议选择
  const handleSuggestionSelect = (value: string, option: any) => {
    setQuery(value);
    onSuggestionSelect?.(value);
    handleSearch(value);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedSuggestion = suggestions[highlightedIndex];
          handleSuggestionSelect(selectedSuggestion.value, selectedSuggestion);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // 清除搜索
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // 删除历史记录项
  const handleDeleteHistoryItem = (e: React.MouseEvent, itemQuery: string) => {
    e.stopPropagation();
    const historyItems = searchHistory.getSearchHistory();
    const itemToDelete = historyItems.find(item => item.query === itemQuery);
    if (itemToDelete) {
      searchHistory.removeSearchHistory(itemToDelete.id);
      debouncedGenerateSuggestions(query);
    }
  };

  // 更新搜索统计
  const updateSearchStats = () => {
    const stats = searchHistory.getSearchStats();
    setSearchStats(stats);
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

  // 搜索历史管理菜单
  const historyMenu = {
    items: [
      {
        key: 'clear',
        label: '清除搜索历史',
        icon: <DeleteOutlined />,
        danger: true
      },
      {
        key: 'stats',
        label: '搜索统计',
        icon: <StarOutlined />
      }
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'clear') {
        searchHistory.clearSearchHistory();
        setSuggestions([]);
      } else if (key === 'stats') {
        updateSearchStats();
      }
    }
  };

  // 渲染建议项
  const renderSuggestionItem = (suggestion: SearchSuggestion, index: number) => (
    <motion.div
      key={`${suggestion.type}-${suggestion.value}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`px-3 py-2 cursor-pointer transition-colors ${
        highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => handleSuggestionSelect(suggestion.value, suggestion)}
    >
      <div className="flex items-center justify-between">
        {suggestion.label}
        {suggestion.type === 'history' && (
          <Button
            size="small"
            type="text"
            icon={<DeleteOutlined />}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => handleDeleteHistoryItem(e, suggestion.value)}
          />
        )}
      </div>
    </motion.div>
  );

  // 初始化
  useEffect(() => {
    updateSearchStats();
  }, []);

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
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            size={size}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPressEnter={() => handleSearch()}
            onFocus={() => {
              setIsDropdownOpen(true);
              debouncedGenerateSuggestions(query);
            }}
            onBlur={() => {
              // 延迟关闭，以便点击建议项
              setTimeout(() => setIsDropdownOpen(false), 200);
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
                  icon={<SearchOutlined />}
                  onClick={() => handleSearch()}
                  className="search-button"
                />
              </Space>
            }
            className="search-input"
          />

          {/* 建议下拉菜单 */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                {suggestions.length > 0 ? (
                  <div className="py-2">
                    {/* 分组显示建议 */}
                    {!query && showHistory && suggestions.some(s => s.type === 'history') && (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                          <ClockCircleOutlined className="mr-1" />
                          最近搜索
                        </div>
                        {suggestions.filter(s => s.type === 'history').map((suggestion, index) =>
                          renderSuggestionItem(suggestion, index)
                        )}
                        <Divider className="my-1" />
                      </>
                    )}

                    {!query && showTrending && suggestions.some(s => s.type === 'trending') && (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                          <RiseOutlined className="mr-1" />
                          热门趋势
                        </div>
                        {suggestions.filter(s => s.type === 'trending').map((suggestion, index) =>
                          renderSuggestionItem(suggestion, suggestions.filter(s => s.type === 'history').length + index)
                        )}
                        <Divider className="my-1" />
                      </>
                    )}

                    {!query && showPopular && suggestions.some(s => s.type === 'popular') && (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                          <FireOutlined className="mr-1" />
                          热门搜索
                        </div>
                        {suggestions.filter(s => s.type === 'popular').map((suggestion, index) => {
                          const prevCount = suggestions.filter(s => s.type === 'history').length + 
                                          suggestions.filter(s => s.type === 'trending').length;
                          return renderSuggestionItem(suggestion, prevCount + index);
                        })}
                      </>
                    )}

                    {query && (
                      <>
                        {suggestions.filter(s => s.type === 'suggestion').length > 0 && (
                          <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                            <SearchOutlined className="mr-1" />
                            搜索建议
                          </div>
                        )}
                        {suggestions.map((suggestion, index) => renderSuggestionItem(suggestion, index))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无搜索建议"
                    />
                  </div>
                )}

                {/* 搜索统计和管理 */}
                {searchStats && (
                  <>
                    <Divider className="my-1" />
                    <div className="px-3 py-2 bg-gray-50">
                      <Space split={<Divider type="vertical" />} size="small">
                        <Text type="secondary" className="text-xs">
                          总搜索 {searchStats.totalSearches}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          独立查询 {searchStats.uniqueQueries}
                        </Text>
                        <Dropdown menu={historyMenu} trigger={['click']}>
                          <Button type="link" size="small" className="p-0 h-auto">
                            <HistoryOutlined />
                          </Button>
                        </Dropdown>
                      </Space>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AdvancedSearch;
