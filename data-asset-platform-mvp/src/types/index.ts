export interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string; // ISO 8601
  requestId?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends APIResponse<PaginatedResult<T>> {}

export type AssetType = 'table' | 'model' | 'report' | 'dashboard';

export interface OwnerInfo {
  id: string;
  name: string;
  email?: string;
  department?: string;
  avatar?: string;
}

export interface Asset {
  id: string;
  name: string;
  displayName?: string;
  type: AssetType;
  database?: string;
  schema?: string;
  fullName?: string;
  description?: string;
  owner?: OwnerInfo;
  tags?: string[];
  qualityScore?: number;
  popularity?: number;
  accessCount?: number;
  createTime?: string; // ISO 8601
  updateTime?: string; // ISO 8601
  lastAccessTime?: string; // ISO 8601
  status?: 'active' | 'inactive';
  dataSize?: {
    rowCount?: number;
    storageSize?: string;
    partitions?: number;
  };
  updateFrequency?: 'hourly' | 'daily' | 'realtime' | string;
  businessValue?: 'low' | 'medium' | 'high' | 'critical' | string;
  sensitivityLevel?: 'low' | 'medium' | 'high';
  location?: string;
}

export interface FieldStatistics {
  uniqueCount?: number;
  nullCount?: number;
  distinctRate?: number;
  minValue?: string | number;
  maxValue?: string | number;
}

export interface FieldInfo {
  id: string;
  assetId: string;
  name: string;
  displayName?: string;
  dataType: string;
  isPrimaryKey?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: any;
  description?: string;
  businessDescription?: string;
  constraints?: string[];
  tags?: string[];
  sampleValues?: any[];
  statistics?: FieldStatistics;
}

export interface LineageNode {
  id: string;
  name: string;
  type: string;
  level?: number;
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  confidence?: number;
}

export interface LineageGraphData {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface FieldLevelLineage {
  sourceAsset: string;
  sourceField: string;
  targetAsset: string;
  targetField: string;
  transformation?: string;
}

export interface ImpactSummary {
  totalAffectedAssets: number;
  criticalAssets: number;
  reports?: number;
  dashboards?: number;
}

export interface ImpactAssetItem {
  id: string;
  name: string;
  type: AssetType | string;
  impactLevel?: 'low' | 'medium' | 'high';
  affectedFields?: string[];
  downstreamCount?: number;
}

export interface ImpactAnalysis {
  impactSummary: ImpactSummary;
  affectedAssets: ImpactAssetItem[];
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    description?: string;
    recommendations?: string[];
  };
}

export interface QualityRuleResult {
  id: string;
  name: string;
  type: string;
  field?: string;
  status: 'passed' | 'warning' | 'failed' | string;
  passRate?: number;
  failureCount?: number;
  totalCount?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  allowedValues?: string[];
  pattern?: string;
}

export interface QualityReport {
  id?: string;
  assetId: string;
  assetName?: string;
  overallScore: number;
  lastCheckTime: string; // ISO 8601
  status: 'passed' | 'warning' | 'failed' | string;
  dimensions: Record<string, { score: number; description?: string; details?: string }>;
  rules: QualityRuleResult[];
  trends?: Array<{ date: string; score: number }>;
  issues?: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    field?: string;
    description?: string;
    affectedRows?: number;
    status?: 'open' | 'closed' | 'ignored';
  }>;
}

export interface DashboardStatistics {
  updateTime?: string;
  summary: Record<string, { current: number; trend?: number; trendType?: 'increase' | 'decrease'; percentage?: number }>;
  assetDistribution?: {
    byType?: Array<{ type: string; name?: string; count: number; percentage?: number }>;
    byDepartment?: Array<{ department: string; count: number; percentage?: number }>;
  };
  accessTrends?: { daily?: Array<{ date: string; accessCount: number }> };
  qualityTrends?: { weekly?: Array<{ week: string; avgScore: number }> };
  topAssets?: Array<{ id: string; name: string; accessCount: number; qualityScore?: number }>;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  roleName?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  createTime?: string;
  lastLoginTime?: string;
  permissions?: string[];
  ownedAssets?: string[];
}

export interface UserActivityItem {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  actionName?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  description?: string;
  timestamp: string;
  status?: string;
}


