import React from 'react';
import { Card, List, Typography, Tag, Space, Button, Tooltip, Badge } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  StarOutlined, 
  ClockCircleOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import SearchHighlight, { getTextSnippet } from './SearchHighlight';
import type { Asset } from '@types/index';

const { Text, Title } = Typography;

interface SearchResultsProps {
  results: Asset[];
  searchQuery: string;
  loading?: boolean;
  onResultClick?: (asset: Asset) => void;
  onPreview?: (asset: Asset) => void;
  onStar?: (asset: Asset) => void;
  showSnippets?: boolean;
  highlightFields?: string[];
  className?: string;
}

interface SearchResultItemProps {
  asset: Asset;
  searchQuery: string;
  onResultClick?: (asset: Asset) => void;
  onPreview?: (asset: Asset) => void;
  onStar?: (asset: Asset) => void;
  showSnippets?: boolean;
  highlightFields?: string[];
  index: number;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  asset,
  searchQuery,
  onResultClick,
  onPreview,
  onStar,
  showSnippets = true,
  highlightFields = ['name', 'description'],
  index
}) => {
  // 获取资产类型图标
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <DatabaseOutlined className="text-blue-500" />;
      case 'model':
        return <BarChartOutlined className="text-green-500" />;
      case 'report':
        return <FileTextOutlined className="text-orange-500" />;
      default:
        return <DatabaseOutlined className="text-gray-500" />;
    }
  };

  // 获取质量评分颜色
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'orange';
    return 'red';
  };

  // 动画配置
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      scale: 1.01,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="mb-4"
    >
      <Card
        hoverable
        className="search-result-item cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        onClick={() => onResultClick?.(asset)}
        styles={{ body: { padding: '20px' } }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 标题和图标 */}
            <div className="flex items-center gap-3 mb-2">
              {getAssetIcon(asset.type)}
              <Title level={4} className="mb-0 flex-1">
                <SearchHighlight
                  text={asset.name}
                  searchQuery={searchQuery}
                  highlightClassName="bg-yellow-200 px-1 py-0.5 rounded font-bold text-yellow-800"
                />
              </Title>
              <Space>
                <Badge count={asset.qualityScore} color={getQualityColor(asset.qualityScore)} />
                <Tag color="blue">{asset.type}</Tag>
              </Space>
            </div>

            {/* 描述 */}
            {asset.description && (
              <div className="mb-3">
                {showSnippets ? (
                  <Text type="secondary" className="leading-relaxed">
                    <SearchHighlight
                      text={getTextSnippet(asset.description, searchQuery, 200)}
                      searchQuery={searchQuery}
                      maxLength={200}
                    />
                  </Text>
                ) : (
                  <Text type="secondary" className="leading-relaxed">
                    <SearchHighlight
                      text={asset.description}
                      searchQuery={searchQuery}
                      maxLength={200}
                    />
                  </Text>
                )}
              </div>
            )}

            {/* 标签 */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="mb-3">
                <Space wrap>
                  {asset.tags.slice(0, 5).map(tag => (
                    <Tag key={tag} size="small" className="cursor-pointer hover:bg-blue-50">
                      <SearchHighlight
                        text={tag}
                        searchQuery={searchQuery}
                        highlightClassName="bg-blue-200 px-1 rounded font-medium text-blue-800"
                      />
                    </Tag>
                  ))}
                  {asset.tags.length > 5 && (
                    <Tag size="small" color="default">
                      +{asset.tags.length - 5}
                    </Tag>
                  )}
                </Space>
              </div>
            )}

            {/* 元信息 */}
            <div className="flex items-center justify-between">
              <Space size="large" className="text-gray-500">
                <Tooltip title="访问次数">
                  <Space size="small">
                    <EyeOutlined />
                    <Text type="secondary">{asset.accessCount || 0}</Text>
                  </Space>
                </Tooltip>
                <Tooltip title="最后更新">
                  <Space size="small">
                    <ClockCircleOutlined />
                    <Text type="secondary">
                      {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '未知'}
                    </Text>
                  </Space>
                </Tooltip>
                {asset.owner && (
                  <Text type="secondary">@{asset.owner}</Text>
                )}
              </Space>

              {/* 操作按钮 */}
              <Space>
                <Tooltip title="预览">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview?.(asset);
                    }}
                  />
                </Tooltip>
                <Tooltip title="收藏">
                  <Button
                    type="text"
                    size="small"
                    icon={<StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStar?.(asset);
                    }}
                  />
                </Tooltip>
                <Tooltip title="下载">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 处理下载逻辑
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchQuery,
  loading = false,
  onResultClick,
  onPreview,
  onStar,
  showSnippets = true,
  highlightFields = ['name', 'description'],
  className = ''
}) => {
  // 容器动画配置
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

  if (loading) {
    return (
      <div className={`search-results-container ${className}`}>
        <List
          dataSource={Array.from({ length: 5 })}
          renderItem={(_, index) => (
            <Card className="mb-4" loading />
          )}
        />
      </div>
    );
  }

  if (!results.length && searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`search-results-container ${className}`}
      >
        <Card className="text-center py-8">
          <div className="text-gray-500">
            <DatabaseOutlined className="text-4xl mb-4 text-gray-300" />
            <Title level={4} type="secondary">
              未找到匹配的结果
            </Title>
            <Text type="secondary">
              尝试使用不同的关键词或调整筛选条件
            </Text>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`search-results-container ${className}`}
    >
      {/* 结果统计 */}
      {searchQuery && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <Text>
            找到 <Text strong className="text-blue-600">{results.length}</Text> 个与 
            <Text strong className="mx-1 text-blue-600">"{searchQuery}"</Text> 
            相关的结果
          </Text>
        </motion.div>
      )}

      {/* 搜索结果列表 */}
      <div className="search-results-list">
        {results.map((asset, index) => (
          <SearchResultItem
            key={asset.id}
            asset={asset}
            searchQuery={searchQuery}
            onResultClick={onResultClick}
            onPreview={onPreview}
            onStar={onStar}
            showSnippets={showSnippets}
            highlightFields={highlightFields}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default SearchResults;
