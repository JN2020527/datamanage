import React, { useState, useRef, useEffect } from 'react';
import { Input, AutoComplete, Button, Space } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@store/useAppStore';
import { api } from '@mock/api';
import { debounce } from '../../utils/index';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onAdvancedSearch?: () => void;
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = '搜索数据资产、字段、标签...',
  onSearch,
  onAdvancedSearch,
  allowClear = true,
  size = 'large',
  style,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);

  const { searchKeyword, searchHistory, setSearchKeyword, addSearchHistory } = useAppStore();

  // 防抖获取搜索建议
  const debouncedGetSuggestions = debounce(async (value: string) => {
    if (!value.trim()) {
      setSuggestions(searchHistory);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.getSearchSuggestions(value);
      setSuggestions([...data, ...searchHistory.filter(h => h.includes(value))].slice(0, 8));
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      setSuggestions(searchHistory.filter(h => h.includes(value)));
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (searchKeyword !== searchValue) {
      setSearchValue(searchKeyword);
    }
  }, [searchKeyword]);

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      setSearchKeyword(trimmedValue);
      addSearchHistory(trimmedValue);
      onSearch?.(trimmedValue);
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    setSearchKeyword(value);
    
    if (value.trim()) {
      debouncedGetSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions(searchHistory);
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (!searchValue.trim() && searchHistory.length > 0) {
      setSuggestions(searchHistory);
      setShowSuggestions(true);
    } else if (searchValue.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSelect = (value: string) => {
    handleSearch(value);
  };

  const handleClear = () => {
    setSearchValue('');
    setSearchKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const options = suggestions.map((suggestion, index) => ({
    value: suggestion,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{suggestion}</span>
        {searchHistory.includes(suggestion) && (
          <span style={{ fontSize: '12px', color: '#999' }}>历史搜索</span>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ width: '100%', ...style }}>
      <Space.Compact style={{ width: '100%' }}>
        <AutoComplete
          ref={inputRef}
          style={{ flex: 2 }} // Modified from flex: 1 to make the search box wider
          size={size}
          value={searchValue}
          options={showSuggestions ? options : []}
          onSearch={handleInputChange}
          onSelect={handleSelect}
          onFocus={handleFocus}
          onBlur={() => {
            // 延迟隐藏，让用户能够点击选项
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          allowClear={allowClear}
          notFoundContent={loading ? '搜索中...' : '暂无建议'}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            suffix={
              searchValue && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  style={{ color: '#bfbfbf' }}
                />
              )
            }
            onPressEnter={() => handleSearch(searchValue)}
          />
        </AutoComplete>
        
        <Button
          type="primary"
          size={size}
          icon={<SearchOutlined />}
          onClick={() => handleSearch(searchValue)}
        >
          搜索
        </Button>
        
        {onAdvancedSearch && (
          <Button
            size={size}
            icon={<FilterOutlined />}
            onClick={onAdvancedSearch}
            title="高级搜索"
          >
            筛选
          </Button>
        )}
      </Space.Compact>
    </div>
  );
};

export default SearchInput;
