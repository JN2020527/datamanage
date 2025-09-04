import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxLength?: number;
  ellipsis?: boolean;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchQuery,
  className = '',
  highlightClassName = 'bg-yellow-200 px-1 py-0.5 rounded font-medium text-yellow-800',
  caseSensitive = false,
  wholeWord = false,
  maxLength,
  ellipsis = true
}) => {
  // 如果没有搜索查询或文本，直接返回原文本
  if (!searchQuery || !text) {
    const displayText = maxLength && text.length > maxLength
      ? `${text.substring(0, maxLength)}${ellipsis ? '...' : ''}`
      : text;
    return <span className={className}>{displayText}</span>;
  }

  // 清理搜索查询
  const cleanQuery = searchQuery.trim();
  if (!cleanQuery) {
    const displayText = maxLength && text.length > maxLength
      ? `${text.substring(0, maxLength)}${ellipsis ? '...' : ''}`
      : text;
    return <span className={className}>{displayText}</span>;
  }

  // 处理文本长度限制
  let processedText = text;
  let wasTruncated = false;

  if (maxLength && text.length > maxLength) {
    // 尝试在搜索词附近截取文本
    const queryIndex = text.toLowerCase().indexOf(cleanQuery.toLowerCase());
    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - Math.floor((maxLength - cleanQuery.length) / 2));
      const end = Math.min(text.length, start + maxLength);
      processedText = text.substring(start, end);
      wasTruncated = start > 0 || end < text.length;
    } else {
      processedText = text.substring(0, maxLength);
      wasTruncated = true;
    }
  }

  // 构建正则表达式
  let flags = 'g';
  if (!caseSensitive) {
    flags += 'i';
  }

  // 转义特殊字符
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 构建模式
  let pattern = escapedQuery;
  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const regex = new RegExp(pattern, flags);

  // 分割文本并高亮匹配部分
  const parts = processedText.split(regex);
  const matches = processedText.match(regex) || [];

  // 构建高亮的JSX元素
  const highlightedText = parts.reduce((acc: React.ReactNode[], part, index) => {
    acc.push(part);
    
    if (index < matches.length) {
      acc.push(
        <mark
          key={`highlight-${index}`}
          className={highlightClassName}
        >
          {matches[index]}
        </mark>
      );
    }
    
    return acc;
  }, []);

  // 添加省略号
  const finalContent = (
    <>
      {wasTruncated && processedText !== text.substring(0, maxLength) && ellipsis && '...'}
      {highlightedText}
      {wasTruncated && ellipsis && '...'}
    </>
  );

  return <span className={className}>{finalContent}</span>;
};

// 高级高亮组件，支持多个关键词
interface MultiSearchHighlightProps extends Omit<SearchHighlightProps, 'searchQuery'> {
  searchQueries: string[];
  highlightColors?: string[];
}

export const MultiSearchHighlight: React.FC<MultiSearchHighlightProps> = ({
  text,
  searchQueries,
  highlightColors = [
    'bg-yellow-200 text-yellow-800',
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-red-200 text-red-800',
    'bg-purple-200 text-purple-800'
  ],
  className = '',
  caseSensitive = false,
  wholeWord = false,
  maxLength,
  ellipsis = true
}) => {
  if (!searchQueries.length || !text) {
    const displayText = maxLength && text.length > maxLength
      ? `${text.substring(0, maxLength)}${ellipsis ? '...' : ''}`
      : text;
    return <span className={className}>{displayText}</span>;
  }

  // 过滤有效的搜索查询
  const validQueries = searchQueries.filter(query => query && query.trim());
  if (!validQueries.length) {
    const displayText = maxLength && text.length > maxLength
      ? `${text.substring(0, maxLength)}${ellipsis ? '...' : ''}`
      : text;
    return <span className={className}>{displayText}</span>;
  }

  // 处理文本长度限制
  let processedText = text;
  let wasTruncated = false;

  if (maxLength && text.length > maxLength) {
    // 找到第一个匹配的查询位置
    let firstMatchIndex = -1;
    for (const query of validQueries) {
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
        firstMatchIndex = index;
      }
    }

    if (firstMatchIndex !== -1) {
      const start = Math.max(0, firstMatchIndex - Math.floor(maxLength / 3));
      const end = Math.min(text.length, start + maxLength);
      processedText = text.substring(start, end);
      wasTruncated = start > 0 || end < text.length;
    } else {
      processedText = text.substring(0, maxLength);
      wasTruncated = true;
    }
  }

  // 创建包含所有查询的组合正则表达式
  let flags = 'g';
  if (!caseSensitive) {
    flags += 'i';
  }

  const escapedQueries = validQueries.map(query => 
    query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  let pattern = escapedQueries.join('|');
  if (wholeWord) {
    pattern = `\\b(${pattern})\\b`;
  } else {
    pattern = `(${pattern})`;
  }

  const regex = new RegExp(pattern, flags);

  // 分割文本并高亮
  const parts: Array<{ text: string; isMatch: boolean; queryIndex: number }> = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(processedText)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      parts.push({
        text: processedText.substring(lastIndex, match.index),
        isMatch: false,
        queryIndex: -1
      });
    }

    // 确定匹配的是哪个查询
    const matchedText = match[0];
    let queryIndex = -1;
    for (let i = 0; i < validQueries.length; i++) {
      const query = validQueries[i].trim();
      if (caseSensitive) {
        if (matchedText === query) {
          queryIndex = i;
          break;
        }
      } else {
        if (matchedText.toLowerCase() === query.toLowerCase()) {
          queryIndex = i;
          break;
        }
      }
    }

    // 如果没有精确匹配，尝试包含匹配
    if (queryIndex === -1) {
      for (let i = 0; i < validQueries.length; i++) {
        const query = validQueries[i].trim();
        if (caseSensitive) {
          if (matchedText.includes(query)) {
            queryIndex = i;
            break;
          }
        } else {
          if (matchedText.toLowerCase().includes(query.toLowerCase())) {
            queryIndex = i;
            break;
          }
        }
      }
    }

    parts.push({
      text: matchedText,
      isMatch: true,
      queryIndex: Math.max(0, queryIndex)
    });

    lastIndex = match.index + match[0].length;

    // 防止无限循环
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  // 添加剩余文本
  if (lastIndex < processedText.length) {
    parts.push({
      text: processedText.substring(lastIndex),
      isMatch: false,
      queryIndex: -1
    });
  }

  // 渲染高亮文本
  const highlightedText = parts.map((part, index) => {
    if (!part.isMatch) {
      return part.text;
    }

    const colorClass = highlightColors[part.queryIndex % highlightColors.length];
    return (
      <mark
        key={`multi-highlight-${index}`}
        className={`px-1 py-0.5 rounded font-medium ${colorClass}`}
      >
        {part.text}
      </mark>
    );
  });

  const finalContent = (
    <>
      {wasTruncated && processedText !== text.substring(0, maxLength || text.length) && ellipsis && '...'}
      {highlightedText}
      {wasTruncated && ellipsis && '...'}
    </>
  );

  return <span className={className}>{finalContent}</span>;
};

// 简化的高亮工具函数
export const highlightText = (text: string, query: string, options?: {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  className?: string;
}): React.ReactNode => {
  return (
    <SearchHighlight
      text={text}
      searchQuery={query}
      caseSensitive={options?.caseSensitive}
      wholeWord={options?.wholeWord}
      highlightClassName={options?.className}
    />
  );
};

// 获取匹配片段的工具函数
export const getTextSnippet = (
  text: string, 
  query: string, 
  maxLength: number = 150,
  contextLength: number = 50
): string => {
  if (!query || !text) return text;

  const queryIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (queryIndex === -1) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  const start = Math.max(0, queryIndex - contextLength);
  const end = Math.min(text.length, queryIndex + query.length + contextLength);
  
  let snippet = text.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
};

export default SearchHighlight;
