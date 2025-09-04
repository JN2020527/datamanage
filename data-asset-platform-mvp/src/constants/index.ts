export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type SortOrder = 'asc' | 'desc';
export type SortBy = 'name' | 'createTime' | 'updateTime' | 'qualityScore' | 'accessCount';

export type AssetType = 'table' | 'model' | 'report' | 'dashboard';
export const ASSET_TYPES: AssetType[] = ['table', 'model', 'report', 'dashboard'];

export type QualityDimension = 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
export const QUALITY_DIMENSIONS: QualityDimension[] = [
  'completeness',
  'accuracy',
  'consistency',
  'timeliness',
  'validity',
];

export type SensitivityLevel = 'low' | 'medium' | 'high';
export const SENSITIVITY_LEVELS: SensitivityLevel[] = ['low', 'medium', 'high'];

export type LineageDirection = 'upstream' | 'downstream' | 'both';
export const DEFAULT_LINEAGE_DIRECTION: LineageDirection = 'both';
export const DEFAULT_LINEAGE_MAX_DEPTH = 3;

export const ISO_TIME_EXAMPLE = '2024-01-17T17:00:00Z';


