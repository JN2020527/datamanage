// 数据资产类型
export type AssetType = 'table' | 'metric' | 'tag';

// 资产状态
export type AssetStatus = 'developing' | 'pending' | 'published' | 'offline';

// 数据质量等级
export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor';

// 用户角色
export type UserRole = 'admin' | 'analyst' | 'developer' | 'viewer';

// 数据资产基本信息
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  owner: string;
  department: string;
  tags: string[];
  qualityScore: number;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  status: AssetStatus;
}

// 字段信息
export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
  constraints?: string[];
}

// 用户信息
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

// 导航菜单项
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

// 统计数据
export interface Statistics {
  totalAssets: number;
  tables: number;
  metrics: number;
  tags: number;
  qualityScore: number;
  todayAccess: number;
}

// 血缘关系
export interface LineageNode {
  id: string;
  name: string;
  type: AssetType;
  level: number;
}

export interface LineageEdge {
  source: string;
  target: string;
  type: 'data_flow' | 'dependency';
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

// 搜索过滤条件
export interface SearchFilter {
  keyword?: string;
  assetTypes?: AssetType[];
  departments?: string[];
  qualityLevels?: QualityLevel[];
  dateRange?: [string, string];
  // 目录筛选（来自目录管理配置的节点 key）
  catalogKeys?: string[];
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 表格列配置
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
}

// 图表配置
export interface ChartConfig {
  type: 'pie' | 'bar' | 'line' | 'area';
  title: string;
  data: any[];
  xField?: string;
  yField?: string;
  colorField?: string;
}

// 报表组件
export interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'text' | 'image';
  title: string;
  config: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 报表定义
export interface Report {
  id: string;
  name: string;
  description: string;
  components: ReportComponent[];
  layout: {
    width: number;
    height: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
