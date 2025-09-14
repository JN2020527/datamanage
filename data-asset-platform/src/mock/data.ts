import { generateId } from '@utils/index';
import type { Asset, User, Statistics, Field } from '@/types/index';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@company.com',
    role: 'admin',
    department: '数据团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    status: 'active',
    lastLogin: '2024-01-15T14:30:00Z',
  },
  {
    id: 'user-002',
    username: 'lisi',
    name: '李四',
    email: 'lisi@company.com',
    role: 'analyst',
    department: '业务团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    status: 'active',
    lastLogin: '2024-01-15T10:20:00Z',
  },
  {
    id: 'user-003',
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@company.com',
    role: 'developer',
    department: '技术团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00Z',
  },
  {
    id: 'user-004',
    username: 'zhaoliu',
    name: '赵六',
    email: 'zhaoliu@company.com',
    role: 'viewer',
    department: '销售团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00Z',
  },
  {
    id: 'user-005',
    username: 'sunqi',
    name: '孙七',
    email: 'sunqi@company.com',
    role: 'developer',
    department: '数据团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
    status: 'inactive',
    lastLogin: '2024-01-10T11:30:00Z',
  },
];

// 模拟字段数据
export const mockFields: Record<string, Field[]> = {
  'asset-001': [
    {
      id: 'field-001',
      name: 'user_id',
      type: 'VARCHAR(50)',
      required: true,
      description: '用户唯一标识',
    },
    {
      id: 'field-002',
      name: 'action_type',
      type: 'VARCHAR(20)',
      required: true,
      description: '用户行为类型（点击、浏览、购买等）',
    },
    {
      id: 'field-003',
      name: 'timestamp',
      type: 'DATETIME',
      required: true,
      defaultValue: 'NOW()',
      description: '行为发生时间',
    },
    {
      id: 'field-004',
      name: 'page_url',
      type: 'TEXT',
      required: false,
      defaultValue: 'NULL',
      description: '用户访问的页面URL',
    },
    {
      id: 'field-005',
      name: 'session_id',
      type: 'VARCHAR(100)',
      required: false,
      description: '会话标识',
    },
  ],
  'asset-002': [
    {
      id: 'field-006',
      name: 'order_id',
      type: 'VARCHAR(50)',
      required: true,
      description: '订单唯一标识',
    },
    {
      id: 'field-007',
      name: 'customer_id',
      type: 'VARCHAR(50)',
      required: true,
      description: '客户ID',
    },
    {
      id: 'field-008',
      name: 'total_amount',
      type: 'DECIMAL(10,2)',
      required: true,
      description: '订单总金额',
    },
    {
      id: 'field-009',
      name: 'order_status',
      type: 'VARCHAR(20)',
      required: true,
      defaultValue: 'pending',
      description: '订单状态',
    },
  ],
};

// 模拟数据资产
export const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    name: '用户行为分析表',
    englishName: 'user_behavior_analysis',
    type: 'table',
    description: '记录用户在平台上的各种行为数据，用于分析用户偏好和优化产品体验',
    owner: '张三',
    department: '数据团队',
    tags: ['用户分析', '行为数据', '产品优化'],
    catalogPath: ['1003', '1004'], // 客户类 > 集团客户
    qualityScore: 95,
    accessCount: 1234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    status: 'published',
  },
  {
    id: 'asset-002',
    name: '订单数据模型',
    englishName: 'order_data_model',
    type: 'metric',
    description: '电商平台订单核心数据模型，包含订单基本信息、商品详情、支付信息等',
    owner: '李四',
    department: '业务团队',
    tags: ['订单管理', '电商数据', '业务核心'],
    catalogPath: ['1008', '1009'], // 收入类 > 财务收入
    qualityScore: 92,
    accessCount: 1156,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    status: 'published',
  },
  {
    id: 'asset-003',
    name: '销售业绩报表',
    englishName: 'sales_performance_report',
    type: 'tag',
    description: '月度销售业绩统计报表，包含各部门、各产品线的销售数据分析',
    owner: '王五',
    department: '销售团队',
    tags: ['销售分析', '业绩统计', '月度报表'],
    catalogPath: ['1008', '1013', '1014'], // 收入类 > 欠费 > 正常欠费
    qualityScore: 88,
    accessCount: 567,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-12T11:20:00Z',
    status: 'published',
  },
  {
    id: 'asset-004',
    name: '客户信息表',
    englishName: 'customer_info_table',
    type: 'table',
    description: '客户基础信息表，包含客户基本资料、联系方式、地址信息等',
    owner: '赵六',
    department: '业务团队',
    tags: ['客户管理', '基础数据', 'CRM'],
    qualityScore: 85,
    accessCount: 445,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    status: 'published',
  },
  {
    id: 'asset-005',
    name: '财务数据模型',
    englishName: 'financial_data_model',
    type: 'metric',
    description: '财务核心数据模型，用于财务报表生成和财务分析',
    owner: '孙七',
    department: '财务团队',
    tags: ['财务分析', '报表生成', '核心模型'],
    qualityScore: 90,
    accessCount: 398,
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-15T08:45:00Z',
    status: 'developing',
  },
  {
    id: 'asset-006',
    name: '产品销量看板',
    englishName: 'product_sales_dashboard',
    type: 'tag',
    description: '实时产品销量数据看板，展示各产品的销售趋势和热门商品',
    owner: '张三',
    department: '产品团队',
    tags: ['销量分析', '实时数据', '产品运营'],
    qualityScore: 87,
    accessCount: 723,
    createdAt: '2024-01-06T15:20:00Z',
    updatedAt: '2024-01-14T17:30:00Z',
    status: 'published',
  },
  {
    id: 'asset-007',
    name: '用户留存分析',
    englishName: 'user_retention_analysis',
    type: 'metric',
    description: '用户留存率分析报表，跟踪新用户的留存情况和流失原因',
    owner: '李四',
    department: '数据团队',
    tags: ['用户留存', '流失分析', '用户运营'],
    qualityScore: 93,
    accessCount: 456,
    createdAt: '2024-01-09T13:15:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    status: 'published',
  },
  {
    id: 'asset-008',
    name: '库存管理表',
    englishName: 'inventory_management_table',
    type: 'table',
    description: '商品库存信息表，记录各商品的库存量、入库出库记录',
    owner: '王五',
    department: '供应链团队',
    tags: ['库存管理', '供应链', '商品管理'],
    qualityScore: 82,
    accessCount: 334,
    createdAt: '2024-01-11T16:40:00Z',
    updatedAt: '2024-01-14T14:25:00Z',
    status: 'pending',
  },
];

// 模拟统计数据
export const mockStatistics: Statistics = {
  totalAssets: 1234,
  tables: 856,
  metrics: 234,
  tags: 144,
  qualityScore: 95,
  todayAccess: 3567,
};

// 模拟最近活动数据
export const mockRecentActivities = [
  {
    id: 'activity-001',
    type: 'view',
    asset: '用户行为分析表',
    user: '张三',
    timestamp: '2024-01-15T14:30:00Z',
    description: '查看了用户行为分析表',
  },
  {
    id: 'activity-002',
    type: 'edit',
    asset: '订单数据模型',
    user: '李四',
    timestamp: '2024-01-15T13:45:00Z',
    description: '编辑了订单数据模型',
  },
  {
    id: 'activity-003',
    type: 'create',
    asset: '新用户分析报表',
    user: '王五',
    timestamp: '2024-01-15T12:20:00Z',
    description: '创建了新用户分析报表',
  },
  {
    id: 'activity-004',
    type: 'view',
    asset: '销售业绩报表',
    user: '赵六',
    timestamp: '2024-01-15T11:15:00Z',
    description: '查看了销售业绩报表',
  },
];

// 模拟热门资产数据
export const mockPopularAssets = [
  {
    id: 'asset-001',
    name: '用户行为分析表',
    englishName: 'user_behavior_analysis',
    type: 'table',
    rating: 4.8,
    viewCount: 1234,
    description: '记录用户在平台上的各种行为数据',
  },
  {
    id: 'asset-002',
    name: '订单数据模型',
    englishName: 'order_data_model',
    type: 'metric',
    rating: 4.9,
    viewCount: 1156,
    description: '电商平台订单核心数据模型',
  },
  {
    id: 'asset-003',
    name: '销售业绩报表',
    englishName: 'sales_performance_report',
    type: 'tag',
    rating: 4.7,
    viewCount: 567,
    description: '月度销售业绩统计报表',
  },
  {
    id: 'asset-004',
    name: '客户信息表',
    englishName: 'customer_info_table',
    type: 'table',
    rating: 4.6,
    viewCount: 445,
    description: '客户基础信息表',
  },
  {
    id: 'asset-005',
    name: '财务数据模型',
    englishName: 'financial_data_model',
    type: 'metric',
    rating: 4.5,
    viewCount: 398,
    description: '财务核心数据模型',
  },
];

// 模拟图表数据
export const mockChartData = {
  // 资产分布饼图数据
  assetDistribution: [
    { name: '数据表', value: 856, percentage: 69.4 },
    { name: '指标', value: 234, percentage: 19.0 },
    { name: '标签', value: 144, percentage: 11.6 },
  ],
  
  // 访问趋势折线图数据
  accessTrend: [
    { date: '2024-01-09', count: 2890 },
    { date: '2024-01-10', count: 3120 },
    { date: '2024-01-11', count: 2756 },
    { date: '2024-01-12', count: 3445 },
    { date: '2024-01-13', count: 3234 },
    { date: '2024-01-14', count: 3567 },
    { date: '2024-01-15', count: 3890 },
  ],
  
  // 质量趋势图数据
  qualityTrend: [
    { date: '2024-01-09', score: 87 },
    { date: '2024-01-10', score: 89 },
    { date: '2024-01-11', score: 91 },
    { date: '2024-01-12', score: 93 },
    { date: '2024-01-13', score: 94 },
    { date: '2024-01-14', score: 95 },
    { date: '2024-01-15', score: 95 },
  ],
};

// 部门列表
export const mockDepartments = [
  '数据团队',
  '业务团队',
  '技术团队',
  '销售团队',
  '产品团队',
  '财务团队',
  '供应链团队',
  '市场团队',
];

// 标签列表
export const mockTags = [
  '用户分析',
  '行为数据',
  '产品优化',
  '订单管理',
  '电商数据',
  '业务核心',
  '销售分析',
  '业绩统计',
  '月度报表',
  '客户管理',
  '基础数据',
  'CRM',
  '财务分析',
  '报表生成',
  '核心模型',
  '销量分析',
  '实时数据',
  '产品运营',
  '用户留存',
  '流失分析',
  '用户运营',
  '库存管理',
  '供应链',
  '商品管理',
];

// 生成更多模拟数据的工具函数
export const generateMoreAssets = (count: number): Asset[] => {
  const types: Asset['type'][] = ['table', 'metric', 'tag'];
  const statuses: Asset['status'][] = ['developing', 'pending', 'published', 'offline'];
  const owners = ['张三', '李四', '王五', '赵六', '孙七'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `asset-${String(index + 100).padStart(3, '0')}`,
    name: `数据资产${index + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    description: `这是第${index + 1}个数据资产的描述信息`,
    owner: owners[Math.floor(Math.random() * owners.length)],
    department: mockDepartments[Math.floor(Math.random() * mockDepartments.length)],
    tags: mockTags.slice(0, Math.floor(Math.random() * 5) + 1),
    qualityScore: Math.floor(Math.random() * 30) + 70,
    accessCount: Math.floor(Math.random() * 1000) + 100,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};
