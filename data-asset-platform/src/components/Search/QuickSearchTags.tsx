import React, { useState, useEffect } from 'react';
import { Tag, Space, Button, Tooltip, Badge } from 'antd';
import { 
  FireOutlined, 
  RiseOutlined, 
  ClockCircleOutlined,
  ReloadOutlined,
  StarOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { searchHistory } from '../../utils/searchHistory';
import type { PopularSearchItem } from '../../utils/searchHistory';

interface QuickSearchTagsProps {
  onTagClick?: (tag: string) => void;
  className?: string;
  showPopular?: boolean;
  showTrending?: boolean;
  showRecent?: boolean;
  maxTags?: number;
  refreshInterval?: number; // 自动刷新间隔（毫秒）
}

interface TagItem {
  text: string;
  type: 'popular' | 'trending' | 'recent';
  count?: number;
  trending?: boolean;
  timestamp?: number;
}

const QuickSearchTags: React.FC<QuickSearchTagsProps> = ({
  onTagClick,
  className = '',
  showPopular = true,
  showTrending = true,
  showRecent = true,
  maxTags = 12,
  refreshInterval = 30000 // 30秒刷新
}) => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取标签数据
  const loadTags = async () => {
    setLoading(true);
    
    try {
      const allTags: TagItem[] = [];

      // 获取热门搜索
      if (showPopular) {
        const popularSearches = searchHistory.getPopularSearches(6);
        popularSearches.forEach(item => {
          allTags.push({
            text: item.query,
            type: 'popular',
            count: item.count,
            trending: item.trending
          });
        });
      }

      // 获取趋势搜索
      if (showTrending) {
        const trendingSearches = searchHistory.getTrendingSearches(4);
        trendingSearches.forEach(item => {
          // 避免重复
          if (!allTags.some(tag => tag.text === item.query)) {
            allTags.push({
              text: item.query,
              type: 'trending',
              count: item.count,
              trending: true
            });
          }
        });
      }

      // 获取最近搜索
      if (showRecent) {
        const recentSearches = searchHistory.getRecentSearches(4);
        recentSearches.forEach(item => {
          // 避免重复
          if (!allTags.some(tag => tag.text === item.query)) {
            allTags.push({
              text: item.query,
              type: 'recent',
              timestamp: item.timestamp
            });
          }
        });
      }

      // 按优先级排序：trending > popular > recent
      const sortedTags = allTags.sort((a, b) => {
        if (a.type === 'trending' && b.type !== 'trending') return -1;
        if (b.type === 'trending' && a.type !== 'trending') return 1;
        if (a.type === 'popular' && b.type === 'recent') return -1;
        if (b.type === 'popular' && a.type === 'recent') return 1;
        
        // 同类型按数量或时间排序
        if (a.type === b.type) {
          if (a.type === 'recent') {
            return (b.timestamp || 0) - (a.timestamp || 0);
          }
          return (b.count || 0) - (a.count || 0);
        }
        
        return 0;
      });

      setTags(sortedTags.slice(0, maxTags));
    } catch (error) {
      console.error('Failed to load search tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理标签点击
  const handleTagClick = (tag: TagItem) => {
    // 添加到搜索历史
    searchHistory.addSearchHistory(tag.text, 'recent');
    
    // 触发回调
    onTagClick?.(tag.text);
  };

  // 获取标签颜色
  const getTagColor = (tag: TagItem): string => {
    switch (tag.type) {
      case 'trending':
        return 'green';
      case 'popular':
        return 'orange';
      case 'recent':
        return 'blue';
      default:
        return 'default';
    }
  };

  // 获取标签图标
  const getTagIcon = (tag: TagItem) => {
    switch (tag.type) {
      case 'trending':
        return <RiseOutlined className="mr-1" />;
      case 'popular':
        return <FireOutlined className="mr-1" />;
      case 'recent':
        return <ClockCircleOutlined className="mr-1" />;
      default:
        return null;
    }
  };

  // 获取标签提示文本
  const getTagTooltip = (tag: TagItem): string => {
    switch (tag.type) {
      case 'trending':
        return `热门趋势 • 搜索 ${tag.count} 次`;
      case 'popular':
        return `热门搜索 • 搜索 ${tag.count} 次`;
      case 'recent':
        return `最近搜索 • ${new Date(tag.timestamp || 0).toLocaleString()}`;
      default:
        return tag.text;
    }
  };

  // 手动刷新
  const handleRefresh = () => {
    loadTags();
  };

  // 初始化和定时刷新
  useEffect(() => {
    loadTags();

    // 设置定时刷新
    const interval = setInterval(loadTags, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, showPopular, showTrending, showRecent, maxTags]);

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  if (!tags.length && !loading) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SearchOutlined className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">快速搜索</span>
        </div>
        <Tooltip title="刷新标签">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700"
          />
        </Tooltip>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2"
      >
        <AnimatePresence mode="popLayout">
          {tags.map((tag, index) => (
            <motion.div
              key={`${tag.type}-${tag.text}`}
              variants={itemVariants}
              whileHover="hover"
              exit="exit"
              layout
              custom={index}
            >
              <Tooltip title={getTagTooltip(tag)} placement="top">
                <motion.div
                  variants={hoverVariants}
                  whileHover="hover"
                  className="cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  <Badge
                    count={tag.trending ? <StarOutlined className="text-yellow-500" /> : 0}
                    size="small"
                    offset={[-2, 2]}
                  >
                    <Tag
                      color={getTagColor(tag)}
                      className="flex items-center gap-1 px-3 py-1 text-sm border-0 shadow-sm hover:shadow-md transition-all duration-200"
                      style={{
                        borderRadius: '16px',
                        background: tag.type === 'trending' 
                          ? 'linear-gradient(45deg, #52c41a, #73d13d)'
                          : tag.type === 'popular'
                          ? 'linear-gradient(45deg, #fa8c16, #ffa940)'
                          : 'linear-gradient(45deg, #1890ff, #40a9ff)'
                      }}
                    >
                      {getTagIcon(tag)}
                      <span className="text-white font-medium">{tag.text}</span>
                      {tag.count && tag.count > 1 && (
                        <span className="ml-1 text-xs opacity-80">
                          {tag.count}
                        </span>
                      )}
                    </Tag>
                  </Badge>
                </motion.div>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {tags.length === 0 && loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <ReloadOutlined className="animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      )}

      {tags.length === 0 && !loading && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">暂无搜索标签</p>
          <Button
            type="link"
            size="small"
            onClick={handleRefresh}
            className="text-blue-500"
          >
            点击刷新
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuickSearchTags;