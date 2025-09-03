# API接口设计文档

## 1. 接口概览

### 🚀 **API基础信息**

| 配置项       | 值                        | 说明                   |
| ------------ | ------------------------- | ---------------------- |
| **基础URL**  | `http://localhost:3001`   | 开发环境API地址        |
| **API版本**  | `v1`                      | 当前API版本            |
| **完整路径** | `http://localhost:3001/api/v1` | API完整基础路径  |
| **数据格式** | `JSON`                    | 请求和响应格式         |
| **编码**     | `UTF-8`                   | 字符编码               |

### 📋 **接口分类**

| 分类         | 描述               | 数量 | 主要用途                   |
| ------------ | ------------------ | ---- | -------------------------- |
| **资产管理** | 数据资产相关接口   | 8个  | 资产CRUD、详情查看、搜索   |
| **数据质量** | 质量检查相关接口   | 4个  | 质量报告、规则管理、监控   |
| **数据血缘** | 血缘关系相关接口   | 3个  | 血缘查询、图谱展示、分析   |
| **用户管理** | 用户和权限接口     | 5个  | 用户信息、角色权限、活动   |
| **统计分析** | 统计数据接口       | 4个  | 概览统计、趋势分析、报表   |
| **系统管理** | 系统配置相关接口   | 3个  | 配置管理、系统状态、日志   |

## 2. 通用响应格式

### 📦 **标准响应结构**

```typescript
interface APIResponse<T> {
  code: number;          // 状态码：0-成功，非0-失败
  message: string;       // 响应消息
  data: T;              // 响应数据
  timestamp: string;     // 响应时间戳
  requestId?: string;    // 请求ID（可选）
}

// 分页响应结构
interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    list: T[];           // 数据列表
    total: number;       // 总数量
    page: number;        // 当前页码
    pageSize: number;    // 每页大小
    totalPages: number;  // 总页数
  };
  timestamp: string;
}

// 错误响应结构
interface ErrorResponse {
  code: number;
  message: string;
  error?: {
    type: string;        // 错误类型
    details: string;     // 错误详情
    stack?: string;      // 错误堆栈（仅开发环境）
  };
  timestamp: string;
}
```

### 🔢 **状态码定义**

| 状态码 | 含义           | 说明                           |
| ------ | -------------- | ------------------------------ |
| `0`    | 成功           | 请求处理成功                   |
| `1001` | 参数错误       | 请求参数不正确或缺失           |
| `1002` | 资源不存在     | 请求的资源未找到               |
| `1003` | 权限不足       | 当前用户无权限访问该资源       |
| `1004` | 操作失败       | 业务操作执行失败               |
| `1005` | 系统错误       | 服务器内部错误                 |
| `1006` | 网络超时       | 请求处理超时                   |

## 3. 资产管理接口

### 📊 **3.1 获取资产列表**

**接口信息**
```
GET /api/v1/assets
```

**请求参数**
```typescript
interface GetAssetsParams {
  page?: number;         // 页码，默认1
  pageSize?: number;     // 每页大小，默认20
  type?: string;         // 资产类型：table, model, report, dashboard
  department?: string;   // 所属部门
  owner?: string;        // 负责人
  tags?: string[];       // 标签列表
  qualityScore?: {       // 质量评分范围
    min?: number;
    max?: number;
  };
  createTime?: {         // 创建时间范围
    start?: string;
    end?: string;
  };
  keyword?: string;      // 搜索关键词
  sortBy?: string;       // 排序字段：name, createTime, updateTime, qualityScore
  sortOrder?: 'asc' | 'desc'; // 排序方向
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "displayName": "用户行为分析表",
        "type": "table",
        "database": "user_analytics",
        "description": "记录用户在平台上的各种行为数据",
        "owner": {
          "id": "user_001",
          "name": "张三",
          "department": "数据团队"
        },
        "tags": ["用户分析", "行为数据"],
        "qualityScore": 95,
        "popularity": 4.8,
        "accessCount": 1234,
        "createTime": "2024-01-15T09:30:00Z",
        "updateTime": "2024-01-17T14:30:00Z"
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 🔍 **3.2 获取资产详情**

**接口信息**
```
GET /api/v1/assets/{assetId}
```

**路径参数**
- `assetId`: 资产ID

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": "asset_001",
    "name": "用户行为分析表",
    "displayName": "用户行为分析表",
    "type": "table",
    "database": "user_analytics",
    "schema": "dw",
    "fullName": "user_analytics.dw.user_behavior_log",
    "description": "记录用户在平台上的各种行为数据，包括页面访问、点击事件、停留时间等",
    "owner": {
      "id": "user_001",
      "name": "张三",
      "email": "zhangsan@company.com",
      "department": "数据团队"
    },
    "tags": ["用户分析", "行为数据", "产品优化"],
    "qualityScore": 95,
    "popularity": 4.8,
    "accessCount": 1234,
    "createTime": "2024-01-15T09:30:00Z",
    "updateTime": "2024-01-17T14:30:00Z",
    "lastAccessTime": "2024-01-17T16:45:00Z",
    "status": "active",
    "dataSize": {
      "rowCount": 12456789,
      "storageSize": "2.3GB",
      "partitions": 30
    },
    "updateFrequency": "hourly",
    "businessValue": "high",
    "sensitivityLevel": "medium",
    "location": "s3://data-lake/user-analytics/user_behavior_log/"
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 📝 **3.3 获取资产字段信息**

**接口信息**
```
GET /api/v1/assets/{assetId}/fields
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "id": "field_001",
      "name": "user_id",
      "displayName": "用户ID",
      "dataType": "VARCHAR(32)",
      "isPrimaryKey": true,
      "isRequired": true,
      "isUnique": true,
      "defaultValue": null,
      "description": "用户唯一标识符，用于关联用户信息表",
      "businessDescription": "平台注册用户的唯一身份标识",
      "constraints": ["NOT NULL", "UNIQUE", "LENGTH = 32"],
      "tags": ["用户标识", "主键", "关联字段"],
      "sampleValues": [
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "b2c3d4e5-f6g7-8901-bcde-f23456789012"
      ],
      "statistics": {
        "uniqueCount": 1234567,
        "nullCount": 0,
        "distinctRate": 1.0
      }
    }
  ],
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 🔎 **3.4 搜索资产**

**接口信息**
```
POST /api/v1/assets/search
```

**请求体**
```typescript
interface SearchAssetsRequest {
  keyword: string;       // 搜索关键词
  filters?: {
    type?: string[];     // 资产类型过滤
    department?: string[]; // 部门过滤
    tags?: string[];     // 标签过滤
    dateRange?: {        // 时间范围过滤
      start?: string;
      end?: string;
    };
  };
  highlight?: boolean;   // 是否高亮搜索词
  page?: number;
  pageSize?: number;
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "搜索成功",
  "data": {
    "list": [
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "type": "table",
        "description": "记录<em>用户</em>在平台上的各种<em>行为</em>数据",
        "owner": "张三",
        "qualityScore": 95,
        "relevanceScore": 0.95,
        "matchedFields": ["name", "description", "tags"]
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2,
    "searchTime": 45,
    "suggestions": ["用户画像", "行为分析", "用户标签"]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 💡 **3.5 获取搜索建议**

**接口信息**
```
GET /api/v1/assets/search/suggestions?q={keyword}
```

**请求参数**
- `q`: 搜索关键词

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "suggestions": [
      {
        "text": "用户行为分析表",
        "type": "asset",
        "category": "资产名称",
        "count": 1
      },
      {
        "text": "用户分析",
        "type": "tag",
        "category": "标签",
        "count": 5
      },
      {
        "text": "user_id",
        "type": "field",
        "category": "字段名称",
        "count": 12
      }
    ]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

## 4. 数据血缘接口

### 🔗 **4.1 获取资产血缘关系**

**接口信息**
```
GET /api/v1/assets/{assetId}/lineage
```

**请求参数**
```typescript
interface GetLineageParams {
  direction?: 'upstream' | 'downstream' | 'both'; // 血缘方向，默认both
  depth?: number;        // 血缘深度，默认3
  includeFields?: boolean; // 是否包含字段级血缘，默认false
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "nodes": [
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "type": "table",
        "level": 0,
        "position": {
          "x": 300,
          "y": 200
        },
        "metadata": {
          "database": "user_analytics",
          "owner": "张三",
          "qualityScore": 95
        }
      },
      {
        "id": "asset_004",
        "name": "原始用户行为日志表",
        "type": "table",
        "level": -1,
        "position": {
          "x": 100,
          "y": 200
        }
      }
    ],
    "edges": [
      {
        "id": "edge_001",
        "source": "asset_004",
        "target": "asset_001",
        "type": "etl_process",
        "label": "ETL处理",
        "confidence": 0.95,
        "processName": "user_behavior_etl_job",
        "transformationDescription": "数据清洗和转换"
      }
    ],
    "fieldLineage": [
      {
        "sourceAsset": "asset_004",
        "sourceField": "raw_user_id",
        "targetAsset": "asset_001",
        "targetField": "user_id",
        "transformation": "CLEAN(raw_user_id)"
      }
    ]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 📈 **4.2 获取血缘影响分析**

**接口信息**
```
GET /api/v1/assets/{assetId}/impact-analysis
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "impactSummary": {
      "totalAffectedAssets": 15,
      "criticalAssets": 3,
      "reports": 5,
      "dashboards": 2
    },
    "affectedAssets": [
      {
        "id": "asset_005",
        "name": "用户画像表",
        "type": "table",
        "impactLevel": "high",
        "affectedFields": ["user_id", "behavior_score"],
        "downstreamCount": 8
      }
    ],
    "riskAssessment": {
      "level": "medium",
      "description": "修改此资产可能影响多个下游报表和分析流程",
      "recommendations": [
        "建议在非业务高峰期进行变更",
        "提前通知相关业务方",
        "准备数据回滚方案"
      ]
    }
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

## 5. 数据质量接口

### 📊 **5.1 获取资产质量报告**

**接口信息**
```
GET /api/v1/assets/{assetId}/quality
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "overallScore": 95,
    "lastCheckTime": "2024-01-17T14:30:00Z",
    "status": "passed",
    "dimensions": {
      "completeness": {
        "score": 98,
        "description": "数据完整性",
        "details": "缺失值比例低于2%"
      },
      "accuracy": {
        "score": 94,
        "description": "数据准确性",
        "details": "数据格式正确率94%"
      }
    },
    "rules": [
      {
        "id": "rule_001",
        "name": "用户ID非空检查",
        "type": "not_null",
        "field": "user_id",
        "status": "passed",
        "passRate": 100.0,
        "failureCount": 0,
        "totalCount": 1234567,
        "severity": "critical"
      }
    ],
    "trends": [
      {
        "date": "2024-01-10",
        "score": 93
      },
      {
        "date": "2024-01-17",
        "score": 95
      }
    ],
    "issues": [
      {
        "id": "issue_001",
        "type": "data_anomaly",
        "severity": "medium",
        "field": "action_type",
        "description": "发现未知的行为类型值",
        "affectedRows": 71653,
        "status": "open"
      }
    ]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### ⚡ **5.2 执行质量检查**

**接口信息**
```
POST /api/v1/assets/{assetId}/quality/check
```

**请求体**
```typescript
interface QualityCheckRequest {
  rules?: string[];      // 指定检查规则ID，为空则执行所有规则
  async?: boolean;       // 是否异步执行，默认false
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "质量检查已启动",
  "data": {
    "checkId": "check_001",
    "status": "running",
    "startTime": "2024-01-17T17:00:00Z",
    "estimatedDuration": 300
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

## 6. 用户管理接口

### 👥 **6.1 获取用户信息**

**接口信息**
```
GET /api/v1/users/{userId}
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": "user_001",
    "username": "zhangsan",
    "name": "张三",
    "email": "zhangsan@company.com",
    "department": "数据团队",
    "role": "data_engineer",
    "roleName": "数据工程师",
    "avatar": "/avatars/zhangsan.jpg",
    "status": "active",
    "createTime": "2023-06-15T09:00:00Z",
    "lastLoginTime": "2024-01-17T08:30:00Z",
    "permissions": [
      "asset.read",
      "asset.create",
      "asset.edit"
    ],
    "ownedAssetsCount": 15,
    "recentActivities": [
      {
        "action": "edit_asset",
        "assetName": "用户行为分析表",
        "timestamp": "2024-01-17T14:30:00Z"
      }
    ]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 📝 **6.2 获取用户活动日志**

**接口信息**
```
GET /api/v1/users/{userId}/activities
```

**请求参数**
```typescript
interface GetUserActivitiesParams {
  page?: number;
  pageSize?: number;
  action?: string;       // 活动类型过滤
  dateRange?: {
    start?: string;
    end?: string;
  };
}
```

## 7. 统计分析接口

### 📈 **7.1 获取首页统计数据**

**接口信息**
```
GET /api/v1/dashboard/statistics
```

**响应示例**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "summary": {
      "totalAssets": {
        "current": 1234,
        "trend": 12,
        "trendType": "increase",
        "percentage": 1.0
      },
      "avgQualityScore": {
        "current": 95,
        "trend": 2,
        "trendType": "increase",
        "percentage": 2.1
      }
    },
    "assetDistribution": {
      "byType": [
        {
          "type": "table",
          "name": "数据表",
          "count": 856,
          "percentage": 69.4
        }
      ]
    },
    "accessTrends": {
      "daily": [
        {
          "date": "2024-01-10",
          "accessCount": 2456
        }
      ]
    },
    "topAssets": [
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "accessCount": 1234,
        "qualityScore": 95
      }
    ]
  },
  "timestamp": "2024-01-17T17:00:00Z"
}
```

### 📊 **7.2 获取图表数据**

**接口信息**
```
GET /api/v1/charts/{chartType}
```

**支持的图表类型**
- `asset-distribution`: 资产分布图
- `quality-trends`: 质量趋势图
- `access-trends`: 访问趋势图
- `department-stats`: 部门统计图

## 8. Mock服务实现

### 🛠 **JSON Server配置**

**db.json结构**
```json
{
  "assets": [],
  "fields": [],
  "lineage": [],
  "quality": [],
  "users": [],
  "statistics": {},
  "activities": []
}
```

**routes.json路由配置**
```json
{
  "/api/v1/assets": "/assets",
  "/api/v1/assets/:id": "/assets/:id",
  "/api/v1/assets/:id/fields": "/fields?assetId=:id",
  "/api/v1/assets/:id/lineage": "/lineage?assetId=:id",
  "/api/v1/assets/:id/quality": "/quality?assetId=:id",
  "/api/v1/users": "/users",
  "/api/v1/dashboard/statistics": "/statistics"
}
```

### 🚀 **启动脚本**

**package.json scripts**
```json
{
  "scripts": {
    "mock": "json-server --watch public/data/db.json --routes public/data/routes.json --port 3001 --host 0.0.0.0"
  }
}
```

这套API接口设计为前端开发提供了完整的数据交互规范，支持所有MVP功能的实现，同时具备良好的扩展性和维护性。 