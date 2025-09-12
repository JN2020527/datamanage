import Mock from 'mockjs';
import {
  mockAssets,
  mockUsers,
  mockStatistics,
  mockRecentActivities,
  mockPopularAssets,
  mockChartData,
  mockFields,
  mockDepartments,
  mockTags,
  generateMoreAssets,
} from './data';
import type { Asset, User, SearchFilter, PaginationParams, ApiResponse } from '@types/index';

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 扩展资产数据
const allAssets = [...mockAssets, ...generateMoreAssets(50)];

class MockApiService {
  /**
   * 获取统计数据
   */
  async getStatistics(): Promise<ApiResponse<typeof mockStatistics>> {
    await delay(300);
    return {
      success: true,
      data: mockStatistics,
    };
  }

  /**
   * 获取资产列表
   */
  async getAssets(params: {
    pagination?: PaginationParams;
    filter?: SearchFilter;
  } = {}): Promise<ApiResponse<Asset[]>> {
    await delay(500);
    
    const { pagination = { page: 1, pageSize: 20 }, filter = {} } = params;
    let filteredAssets = [...allAssets];

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filteredAssets = filteredAssets.filter(
        asset =>
          asset.name.toLowerCase().includes(keyword) ||
          asset.description.toLowerCase().includes(keyword) ||
          asset.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }

    // 资产类型筛选
    if (filter.assetTypes?.length) {
      filteredAssets = filteredAssets.filter(asset =>
        filter.assetTypes!.includes(asset.type)
      );
    }

    // 部门筛选
    if (filter.departments?.length) {
      filteredAssets = filteredAssets.filter(asset =>
        filter.departments!.includes(asset.department)
      );
    }

    // 质量等级筛选
    if (filter.qualityLevels?.length) {
      filteredAssets = filteredAssets.filter(asset => {
        const score = asset.qualityScore;
        return filter.qualityLevels!.some(level => {
          switch (level) {
            case 'excellent':
              return score >= 90;
            case 'good':
              return score >= 80 && score < 90;
            case 'fair':
              return score >= 70 && score < 80;
            case 'poor':
              return score < 70;
            default:
              return false;
          }
        });
      });
    }

    // 分页处理
    const total = filteredAssets.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedAssets = filteredAssets.slice(start, end);

    return {
      success: true,
      data: paginatedAssets,
      total,
    };
  }

  /**
   * 获取资产详情
   */
  async getAssetDetail(id: string): Promise<ApiResponse<Asset & { fields?: any[] }>> {
    await delay(300);
    
    const asset = allAssets.find(item => item.id === id);
    if (!asset) {
      return {
        success: false,
        message: '资产不存在',
        data: null,
      };
    }

    return {
      success: true,
      data: {
        ...asset,
        fields: mockFields[id] || [],
      },
    };
  }

  /**
   * 获取用户列表
   */
  async getUsers(params: {
    pagination?: PaginationParams;
    filter?: { keyword?: string; department?: string; role?: string };
  } = {}): Promise<ApiResponse<User[]>> {
    await delay(400);
    
    const { pagination = { page: 1, pageSize: 20 }, filter = {} } = params;
    let filteredUsers = [...mockUsers];

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user =>
          user.name.toLowerCase().includes(keyword) ||
          user.username.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
      );
    }

    // 部门筛选
    if (filter.department) {
      filteredUsers = filteredUsers.filter(user => user.department === filter.department);
    }

    // 角色筛选
    if (filter.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filter.role);
    }

    // 分页处理
    const total = filteredUsers.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      success: true,
      data: paginatedUsers,
      total,
    };
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(200);
    return {
      success: true,
      data: mockUsers[0], // 默认返回第一个用户
    };
  }

  /**
   * 获取最近活动
   */
  async getRecentActivities(): Promise<ApiResponse<typeof mockRecentActivities>> {
    await delay(300);
    return {
      success: true,
      data: mockRecentActivities,
    };
  }

  /**
   * 获取热门资产
   */
  async getPopularAssets(): Promise<ApiResponse<typeof mockPopularAssets>> {
    await delay(300);
    return {
      success: true,
      data: mockPopularAssets,
    };
  }

  /**
   * 获取图表数据
   */
  async getChartData(): Promise<ApiResponse<typeof mockChartData>> {
    await delay(400);
    return {
      success: true,
      data: mockChartData,
    };
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(keyword: string): Promise<ApiResponse<string[]>> {
    await delay(200);
    
    if (!keyword) {
      return { success: true, data: [] };
    }

    const suggestions = [
      ...allAssets
        .filter(asset => asset.name.toLowerCase().includes(keyword.toLowerCase()))
        .map(asset => asset.name)
        .slice(0, 5),
      ...mockTags
        .filter(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 3),
    ];

    return {
      success: true,
      data: [...new Set(suggestions)], // 去重
    };
  }

  /**
   * 创建资产
   */
  async createAsset(assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    await delay(800);
    
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: assetData.name || '',
      type: assetData.type || 'table',
      description: assetData.description || '',
      owner: assetData.owner || '张三',
      department: assetData.department || '数据团队',
      tags: assetData.tags || [],
      qualityScore: 0,
      accessCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'developing',
    };

    allAssets.unshift(newAsset);

    return {
      success: true,
      data: newAsset,
    };
  }

  /**
   * 更新资产
   */
  async updateAsset(id: string, assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    await delay(800);
    
    const index = allAssets.findIndex(asset => asset.id === id);
    if (index === -1) {
      return {
        success: false,
        message: '资产不存在',
        data: null,
      };
    }

    allAssets[index] = {
      ...allAssets[index],
      ...assetData,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: allAssets[index],
    };
  }

  /**
   * 删除资产
   */
  async deleteAsset(id: string): Promise<ApiResponse<boolean>> {
    await delay(500);
    
    const index = allAssets.findIndex(asset => asset.id === id);
    if (index === -1) {
      return {
        success: false,
        message: '资产不存在',
        data: false,
      };
    }

    allAssets.splice(index, 1);

    return {
      success: true,
      data: true,
    };
  }

  /**
   * 获取我的资产列表
   */
  async getMyAssets(): Promise<ApiResponse<Asset[]>> {
    await delay(500);
    
    // 模拟当前用户的资产，可以根据实际需求筛选
    // 这里假设用户拥有部分资产，并添加一些状态变化
    const myAssets = allAssets.slice(0, 15).map((asset, index) => {
      // 模拟不同的状态
      const statuses = ['draft', 'developing', 'pending', 'published', 'offline'];
      const randomStatus = statuses[index % statuses.length];
      
      return {
        ...asset,
        status: randomStatus as any,
        owner: '当前用户', // 假设当前用户拥有这些资产
      };
    });

    return {
      success: true,
      data: myAssets,
    };
  }

  /**
   * 获取部门列表
   */
  async getDepartments(): Promise<ApiResponse<string[]>> {
    await delay(200);
    return {
      success: true,
      data: mockDepartments,
    };
  }

  /**
   * 获取标签列表
   */
  async getTags(): Promise<ApiResponse<string[]>> {
    await delay(200);
    return {
      success: true,
      data: mockTags,
    };
  }

  /**
   * 用户登录
   */
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1000);
    
    const user = mockUsers.find(u => u.username === credentials.username);
    if (!user) {
      return {
        success: false,
        message: '用户名或密码错误',
        data: null,
      };
    }

    // 模拟token生成
    const token = Mock.Random.string('lower', 32);

    return {
      success: true,
      data: {
        user,
        token,
      },
    };
  }

  /**
   * 获取血缘关系数据
   */
  async getLineageData(assetId: string): Promise<ApiResponse<any>> {
    await delay(600);
    
    // 模拟血缘关系数据
    const lineageData = {
      nodes: [
        { id: 'raw_logs', name: '原始日志表', type: 'table', level: 0 },
        { id: 'user_info', name: '用户信息表', type: 'table', level: 0 },
        { id: 'user_behavior', name: '用户行为分析表', type: 'table', level: 1 },
        { id: 'user_profile', name: '用户画像表', type: 'table', level: 2 },
        { id: 'user_analysis', name: '用户分析报表', type: 'report', level: 3 },
      ],
      edges: [
        { source: 'raw_logs', target: 'user_behavior', type: 'data_flow' },
        { source: 'user_info', target: 'user_behavior', type: 'data_flow' },
        { source: 'user_behavior', target: 'user_profile', type: 'data_flow' },
        { source: 'user_profile', target: 'user_analysis', type: 'data_flow' },
      ],
    };

    return {
      success: true,
      data: lineageData,
    };
  }
}

// 创建API服务实例
export const mockApi = new MockApiService();

// 导出API方法
export const api = {
  getStatistics: () => mockApi.getStatistics(),
  getAssets: (params?: any) => mockApi.getAssets(params),
  getAssetDetail: (id: string) => mockApi.getAssetDetail(id),
  getUsers: (params?: any) => mockApi.getUsers(params),
  getCurrentUser: () => mockApi.getCurrentUser(),
  getRecentActivities: () => mockApi.getRecentActivities(),
  getPopularAssets: () => mockApi.getPopularAssets(),
  getChartData: () => mockApi.getChartData(),
  getSearchSuggestions: (keyword: string) => mockApi.getSearchSuggestions(keyword),
  createAsset: (data: Partial<Asset>) => mockApi.createAsset(data),
  updateAsset: (id: string, data: Partial<Asset>) => mockApi.updateAsset(id, data),
  deleteAsset: (id: string) => mockApi.deleteAsset(id),
  getDepartments: () => mockApi.getDepartments(),
  getTags: () => mockApi.getTags(),
  login: (credentials: { username: string; password: string }) => mockApi.login(credentials),
  getLineageData: (assetId: string) => mockApi.getLineageData(assetId),
};
