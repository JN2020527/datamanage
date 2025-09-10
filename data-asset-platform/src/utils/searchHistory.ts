export type SearchHistoryItem = {
  id: string;
  query: string;
  timestamp: number;
  type: 'search' | 'suggestion' | 'recent';
  resultCount?: number;
  category?: string;
};

export type PopularSearchItem = {
  query: string;
  count: number;
  category?: string;
  trending?: boolean;
};

const STORAGE_KEY = 'data-asset-search-history';
const POPULAR_SEARCHES_KEY = 'data-asset-popular-searches';
const MAX_HISTORY_ITEMS = 50;
const MAX_POPULAR_ITEMS = 20;

export class SearchHistoryManager {
  private static instance: SearchHistoryManager;
  private history: SearchHistoryItem[] = [];
  private popularSearches: PopularSearchItem[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): SearchHistoryManager {
    if (!SearchHistoryManager.instance) {
      SearchHistoryManager.instance = new SearchHistoryManager();
    }
    return SearchHistoryManager.instance;
  }

  // 加载搜索历史
  private loadFromStorage(): void {
    try {
      const historyData = localStorage.getItem(STORAGE_KEY);
      const popularData = localStorage.getItem(POPULAR_SEARCHES_KEY);
      
      if (historyData) {
        this.history = JSON.parse(historyData);
      }
      
      if (popularData) {
        this.popularSearches = JSON.parse(popularData);
      }
    } catch (error) {
      console.warn('Failed to load search history from storage:', error);
      this.history = [];
      this.popularSearches = [];
    }
  }

  // 保存到本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      localStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(this.popularSearches));
    } catch (error) {
      console.warn('Failed to save search history to storage:', error);
    }
  }

  // 添加搜索记录
  public addSearchHistory(
    query: string, 
    type: 'search' | 'suggestion' | 'recent' = 'search',
    resultCount?: number,
    category?: string
  ): void {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    
    // 移除重复的查询
    this.history = this.history.filter(item => item.query !== trimmedQuery);
    
    // 添加新的搜索记录
    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: trimmedQuery,
      timestamp: Date.now(),
      type,
      resultCount,
      category
    };

    this.history.unshift(newItem);

    // 限制历史记录数量
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
    }

    // 更新热门搜索
    this.updatePopularSearches(trimmedQuery, category);
    this.saveToStorage();
  }

  // 更新热门搜索
  private updatePopularSearches(query: string, category?: string): void {
    const existingIndex = this.popularSearches.findIndex(item => item.query === query);
    
    if (existingIndex >= 0) {
      // 增加搜索次数
      this.popularSearches[existingIndex].count++;
    } else {
      // 添加新的热门搜索
      this.popularSearches.push({
        query,
        count: 1,
        category,
        trending: false
      });
    }

    // 按搜索次数排序
    this.popularSearches.sort((a, b) => b.count - a.count);

    // 限制热门搜索数量
    if (this.popularSearches.length > MAX_POPULAR_ITEMS) {
      this.popularSearches = this.popularSearches.slice(0, MAX_POPULAR_ITEMS);
    }

    // 标记趋势搜索（最近增长较快的）
    this.markTrendingSearches();
  }

  // 标记趋势搜索
  private markTrendingSearches(): void {
    const recent = Date.now() - 24 * 60 * 60 * 1000; // 24小时内
    const recentSearches = this.history.filter(item => item.timestamp > recent);
    
    const recentCounts: { [key: string]: number } = {};
    recentSearches.forEach(item => {
      recentCounts[item.query] = (recentCounts[item.query] || 0) + 1;
    });

    this.popularSearches.forEach(item => {
      const recentCount = recentCounts[item.query] || 0;
      const totalCount = item.count;
      item.trending = recentCount > 0 && (recentCount / totalCount) > 0.3;
    });
  }

  // 获取搜索历史
  public getSearchHistory(limit: number = 10): SearchHistoryItem[] {
    return this.history.slice(0, limit);
  }

  // 获取最近搜索
  public getRecentSearches(limit: number = 5): SearchHistoryItem[] {
    const recent = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7天内
    return this.history
      .filter(item => item.timestamp > recent)
      .slice(0, limit);
  }

  // 获取热门搜索
  public getPopularSearches(limit: number = 10): PopularSearchItem[] {
    return this.popularSearches.slice(0, limit);
  }

  // 获取趋势搜索
  public getTrendingSearches(limit: number = 5): PopularSearchItem[] {
    return this.popularSearches
      .filter(item => item.trending)
      .slice(0, limit);
  }

  // 按分类获取搜索历史
  public getSearchHistoryByCategory(category: string, limit: number = 10): SearchHistoryItem[] {
    return this.history
      .filter(item => item.category === category)
      .slice(0, limit);
  }

  // 搜索建议
  public getSearchSuggestions(query: string, limit: number = 8): string[] {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return [];

    const suggestions = new Set<string>();
    
    // 从历史记录中匹配
    this.history.forEach(item => {
      if (item.query.toLowerCase().includes(trimmedQuery) && 
          item.query.toLowerCase() !== trimmedQuery) {
        suggestions.add(item.query);
      }
    });

    // 从热门搜索中匹配
    this.popularSearches.forEach(item => {
      if (item.query.toLowerCase().includes(trimmedQuery) && 
          item.query.toLowerCase() !== trimmedQuery) {
        suggestions.add(item.query);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // 清除搜索历史
  public clearSearchHistory(): void {
    this.history = [];
    this.saveToStorage();
  }

  // 删除特定搜索记录
  public removeSearchHistory(id: string): void {
    this.history = this.history.filter(item => item.id !== id);
    this.saveToStorage();
  }

  // 清除热门搜索
  public clearPopularSearches(): void {
    this.popularSearches = [];
    this.saveToStorage();
  }

  // 获取搜索统计
  public getSearchStats(): {
    totalSearches: number;
    uniqueQueries: number;
    avgResultCount: number;
    topCategories: { category: string; count: number }[];
  } {
    const totalSearches = this.history.length;
    const uniqueQueries = new Set(this.history.map(item => item.query)).size;
    
    const resultsWithCount = this.history.filter(item => item.resultCount !== undefined);
    const avgResultCount = resultsWithCount.length > 0 
      ? resultsWithCount.reduce((sum, item) => sum + (item.resultCount || 0), 0) / resultsWithCount.length
      : 0;

    const categoryCount: { [key: string]: number } = {};
    this.history.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSearches,
      uniqueQueries,
      avgResultCount: Math.round(avgResultCount),
      topCategories
    };
  }

  // 导出搜索历史
  public exportSearchHistory(): string {
    return JSON.stringify({
      history: this.history,
      popularSearches: this.popularSearches,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // 导入搜索历史
  public importSearchHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.history && Array.isArray(parsed.history)) {
        this.history = parsed.history;
      }
      if (parsed.popularSearches && Array.isArray(parsed.popularSearches)) {
        this.popularSearches = parsed.popularSearches;
      }
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import search history:', error);
      return false;
    }
  }
}

// 导出单例实例
export const searchHistory = SearchHistoryManager.getInstance();
