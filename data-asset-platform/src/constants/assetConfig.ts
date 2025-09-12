import type { AssetType, QualityLevel } from '@types/index';
import { 
  TableOutlined, 
  PartitionOutlined, 
  BarChartOutlined, 
  DashboardOutlined,
  DatabaseOutlined,
  ApiOutlined,
  FileTextOutlined 
} from '@ant-design/icons';

/**
 * 资产类型配置
 */
export const ASSET_TYPES = [
  { 
    label: '数据表', 
    value: 'table' as AssetType, 
    color: '#1677FF', 
    icon: TableOutlined,
    description: '结构化数据表'
  },
  { 
    label: '数据模型', 
    value: 'model' as AssetType, 
    color: '#722ED1', 
    icon: PartitionOutlined,
    description: '数据建模结果'
  },
  { 
    label: '报表', 
    value: 'report' as AssetType, 
    color: '#52C41A', 
    icon: BarChartOutlined,
    description: '数据分析报表'
  },
  { 
    label: '看板', 
    value: 'dashboard' as AssetType, 
    color: '#FAAD14', 
    icon: DashboardOutlined,
    description: '数据可视化看板'
  },
  { 
    label: '数据集', 
    value: 'dataset' as AssetType, 
    color: '#13C2C2', 
    icon: DatabaseOutlined,
    description: '数据集合'
  },
  { 
    label: 'API', 
    value: 'api' as AssetType, 
    color: '#F759AB', 
    icon: ApiOutlined,
    description: '数据接口'
  },
] as const;

/**
 * 数据质量等级配置
 */
export const QUALITY_LEVELS = [
  { 
    label: '优秀 (90-100分)', 
    value: 'excellent' as QualityLevel, 
    color: '#52C41A',
    range: [90, 100]
  },
  { 
    label: '良好 (80-89分)', 
    value: 'good' as QualityLevel, 
    color: '#1677FF',
    range: [80, 89]
  },
  { 
    label: '一般 (70-79分)', 
    value: 'fair' as QualityLevel, 
    color: '#FAAD14',
    range: [70, 79]
  },
  { 
    label: '待改进 (<70分)', 
    value: 'poor' as QualityLevel, 
    color: '#FF4D4F',
    range: [0, 69]
  },
] as const;

/**
 * 部门配置
 */
export const DEPARTMENTS = [
  { label: '数据团队', value: 'data-team', color: '#1677FF' },
  { label: '业务团队', value: 'business-team', color: '#52C41A' },
  { label: '技术团队', value: 'tech-team', color: '#722ED1' },
  { label: '销售团队', value: 'sales-team', color: '#FAAD14' },
  { label: '运营团队', value: 'ops-team', color: '#13C2C2' },
] as const;

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
} as const;

/**
 * 搜索配置
 */
export const SEARCH_CONFIG = {
  placeholder: '搜索数据资产名称、描述、标签...',
  debounceDelay: 300,
  maxSuggestions: 8,
  maxHistoryItems: 10,
} as const;

/**
 * 表格配置
 */
export const TABLE_CONFIG = {
  scroll: { x: 1200, y: 'calc(100vh - 284px)' }, // 进一步调整滚动高度为分页器留出空间
  size: 'middle' as const,
  sticky: { offsetHeader: 0 },
} as const;

/**
 * 工具函数：根据资产类型获取配置信息
 */
export const getAssetTypeConfig = (type: AssetType) => {
  return ASSET_TYPES.find(item => item.value === type) || ASSET_TYPES[0];
};

/**
 * 工具函数：根据质量分数获取等级配置
 */
export const getQualityLevelConfig = (score: number) => {
  return QUALITY_LEVELS.find(level => 
    score >= level.range[0] && score <= level.range[1]
  ) || QUALITY_LEVELS[3]; // 默认返回"待改进"
};

/**
 * 工具函数：根据部门值获取配置信息
 */
export const getDepartmentConfig = (value: string) => {
  return DEPARTMENTS.find(dept => dept.value === value);
};
