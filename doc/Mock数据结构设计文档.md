# Mock数据结构设计文档

## 1. 数据结构概览

### 📊 **核心数据实体**

| 数据实体     | 用途                   | 文件名           | 数量  |
| ------------ | ---------------------- | ---------------- | ----- |
| **资产信息** | 数据资产基础信息       | assets.json      | 20个  |
| **字段信息** | 数据表字段详情         | fields.json      | 100个 |
| **血缘关系** | 数据血缘依赖关系       | lineage.json     | 15条  |
| **质量数据** | 数据质量检查结果       | quality.json     | 20个  |
| **用户信息** | 系统用户和角色信息     | users.json       | 10个  |
| **统计数据** | 首页概览统计数据       | statistics.json  | 1组   |
| **活动日志** | 用户操作活动记录       | activities.json  | 50条  |

## 2. 资产信息数据结构

### 📋 **assets.json**
```json
{
  "assets": [
    {
      "id": "asset_001",
      "name": "用户行为分析表",
      "displayName": "用户行为分析表",
      "type": "table",
      "database": "user_analytics",
      "schema": "dw",
      "fullName": "user_analytics.dw.user_behavior_log",
      "description": "记录用户在平台上的各种行为数据，包括页面访问、点击事件、停留时间等，用于分析用户偏好和优化产品体验",
      "owner": {
        "id": "user_001",
        "name": "张三",
        "email": "zhangsan@company.com",
        "department": "数据团队"
      },
      "tags": ["用户分析", "行为数据", "产品优化", "核心业务"],
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
      "retentionPolicy": "2years",
      "location": "s3://data-lake/user-analytics/user_behavior_log/",
      "format": "parquet",
      "compression": "snappy"
    },
    {
      "id": "asset_002", 
      "name": "订单数据模型",
      "displayName": "订单数据模型",
      "type": "model",
      "database": "order_system",
      "schema": "ods",
      "fullName": "order_system.ods.order_fact_model",
      "description": "电商订单业务的核心数据模型，包含订单基础信息、商品详情、支付状态、物流信息等完整订单生命周期数据",
      "owner": {
        "id": "user_002",
        "name": "李四",
        "email": "lisi@company.com", 
        "department": "业务团队"
      },
      "tags": ["订单管理", "电商业务", "核心模型", "实时数据"],
      "qualityScore": 92,
      "popularity": 4.9,
      "accessCount": 2156,
      "createTime": "2024-01-10T10:15:00Z",
      "updateTime": "2024-01-16T11:20:00Z",
      "lastAccessTime": "2024-01-17T15:30:00Z",
      "status": "active",
      "dataSize": {
        "rowCount": 8934567,
        "storageSize": "1.8GB",
        "partitions": 24
      },
      "updateFrequency": "realtime",
      "businessValue": "critical",
      "sensitivityLevel": "high",
      "retentionPolicy": "7years",
      "location": "s3://data-lake/order-system/order_fact_model/",
      "format": "delta",
      "compression": "zstd"
    },
    {
      "id": "asset_003",
      "name": "销售业绩分析报表",
      "displayName": "销售业绩分析报表", 
      "type": "report",
      "database": "reporting",
      "schema": "mart",
      "fullName": "reporting.mart.sales_performance_report",
      "description": "基于订单和用户数据生成的销售业绩综合分析报表，包含销售趋势、区域分布、产品排行等关键业务指标",
      "owner": {
        "id": "user_003",
        "name": "王五",
        "email": "wangwu@company.com",
        "department": "销售团队"
      },
      "tags": ["销售分析", "业绩报表", "管理决策", "月度汇报"],
      "qualityScore": 88,
      "popularity": 4.7,
      "accessCount": 567,
      "createTime": "2024-01-12T14:20:00Z",
      "updateTime": "2024-01-17T09:15:00Z", 
      "lastAccessTime": "2024-01-17T17:00:00Z",
      "status": "active",
      "dataSize": {
        "rowCount": 345678,
        "storageSize": "456MB",
        "partitions": 12
      },
      "updateFrequency": "daily",
      "businessValue": "high", 
      "sensitivityLevel": "medium",
      "retentionPolicy": "3years",
      "location": "s3://data-lake/reporting/sales_performance_report/",
      "format": "parquet",
      "compression": "gzip"
    }
  ]
}
```

## 3. 字段信息数据结构

### 🗂️ **fields.json**
```json
{
  "fields": [
    {
      "id": "field_001",
      "assetId": "asset_001",
      "name": "user_id",
      "displayName": "用户ID", 
      "dataType": "VARCHAR(32)",
      "isPrimaryKey": true,
      "isRequired": true,
      "isUnique": true,
      "defaultValue": null,
      "description": "用户唯一标识符，用于关联用户信息表",
      "businessDescription": "平台注册用户的唯一身份标识",
      "dataFormat": "UUID格式，如：a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "constraints": [
        "NOT NULL",
        "UNIQUE",
        "LENGTH = 32"
      ],
      "tags": ["用户标识", "主键", "关联字段"],
      "qualityRules": [
        {
          "type": "not_null",
          "description": "用户ID不能为空"
        },
        {
          "type": "format_check", 
          "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$",
          "description": "必须符合UUID格式"
        }
      ],
      "sampleValues": [
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "b2c3d4e5-f6g7-8901-bcde-f23456789012", 
        "c3d4e5f6-g7h8-9012-cdef-345678901234"
      ],
      "statistics": {
        "uniqueCount": 1234567,
        "nullCount": 0,
        "distinctRate": 1.0
      }
    },
    {
      "id": "field_002",
      "assetId": "asset_001", 
      "name": "action_type",
      "displayName": "行为类型",
      "dataType": "VARCHAR(50)",
      "isPrimaryKey": false,
      "isRequired": true,
      "isUnique": false,
      "defaultValue": null,
      "description": "用户执行的具体行为类型，如点击、浏览、购买等",
      "businessDescription": "标识用户在平台上的具体操作行为",
      "dataFormat": "枚举值：click, view, purchase, search, login, logout",
      "constraints": [
        "NOT NULL",
        "CHECK (action_type IN ('click', 'view', 'purchase', 'search', 'login', 'logout'))"
      ],
      "tags": ["行为分类", "枚举字段", "业务字段"],
      "qualityRules": [
        {
          "type": "not_null",
          "description": "行为类型不能为空"
        },
        {
          "type": "enum_check",
          "values": ["click", "view", "purchase", "search", "login", "logout"],
          "description": "必须是预定义的行为类型"
        }
      ],
      "sampleValues": [
        "click",
        "view", 
        "purchase",
        "search",
        "login"
      ],
      "statistics": {
        "uniqueCount": 6,
        "nullCount": 0,
        "distinctRate": 0.000005
      }
    },
    {
      "id": "field_003",
      "assetId": "asset_001",
      "name": "timestamp",
      "displayName": "时间戳",
      "dataType": "DATETIME",
      "isPrimaryKey": false,
      "isRequired": true,
      "isUnique": false,
      "defaultValue": "CURRENT_TIMESTAMP",
      "description": "行为发生的具体时间，用于时间序列分析",
      "businessDescription": "记录用户行为的精确时间，支持实时分析和历史追溯",
      "dataFormat": "YYYY-MM-DD HH:MM:SS格式",
      "constraints": [
        "NOT NULL",
        "DEFAULT CURRENT_TIMESTAMP"
      ],
      "tags": ["时间字段", "分区字段", "排序字段"],
      "qualityRules": [
        {
          "type": "not_null",
          "description": "时间戳不能为空"
        },
        {
          "type": "range_check",
          "minValue": "2020-01-01 00:00:00",
          "maxValue": "2030-12-31 23:59:59",
          "description": "时间必须在合理范围内"
        }
      ],
      "sampleValues": [
        "2024-01-17 14:30:25",
        "2024-01-17 15:45:12",
        "2024-01-17 16:20:08"
      ],
      "statistics": {
        "uniqueCount": 12456789,
        "nullCount": 0,
        "distinctRate": 1.0,
        "minValue": "2024-01-01 00:00:00",
        "maxValue": "2024-01-17 23:59:59"
      }
    }
  ]
}
```

## 4. 血缘关系数据结构

### 🔗 **lineage.json**
```json
{
  "lineageRelations": [
    {
      "id": "lineage_001",
      "sourceAssetId": "asset_004", 
      "targetAssetId": "asset_001",
      "sourceAssetName": "原始用户行为日志表",
      "targetAssetName": "用户行为分析表",
      "relationType": "derived_from",
      "transformationType": "etl_process",
      "transformationDescription": "通过ETL流程清洗和转换原始日志数据，提取关键行为信息",
      "confidence": 0.95,
      "processName": "user_behavior_etl_job",
      "processId": "job_001",
      "createTime": "2024-01-15T09:30:00Z",
      "lastUpdateTime": "2024-01-17T14:30:00Z",
      "fieldLevelLineage": [
        {
          "sourceField": "raw_user_id",
          "targetField": "user_id", 
          "transformationRule": "CLEAN(raw_user_id)"
        },
        {
          "sourceField": "raw_action",
          "targetField": "action_type",
          "transformationRule": "CASE WHEN raw_action = 'btn_click' THEN 'click' ELSE raw_action END"
        },
        {
          "sourceField": "event_time",
          "targetField": "timestamp",
          "transformationRule": "CAST(event_time AS DATETIME)"
        }
      ],
      "tags": ["数据清洗", "ETL流程", "自动生成"],
      "qualityImpact": "high",
      "schedule": "hourly",
      "status": "active"
    },
    {
      "id": "lineage_002",
      "sourceAssetId": "asset_001",
      "targetAssetId": "asset_005",
      "sourceAssetName": "用户行为分析表", 
      "targetAssetName": "用户画像表",
      "relationType": "aggregated_to",
      "transformationType": "aggregation",
      "transformationDescription": "基于用户行为数据进行聚合分析，生成用户画像特征",
      "confidence": 0.92,
      "processName": "user_profile_aggregation",
      "processId": "job_002",
      "createTime": "2024-01-15T10:00:00Z",
      "lastUpdateTime": "2024-01-17T15:00:00Z",
      "fieldLevelLineage": [
        {
          "sourceField": "user_id",
          "targetField": "user_id",
          "transformationRule": "GROUP BY user_id"
        },
        {
          "sourceField": "action_type",
          "targetField": "behavior_preference",
          "transformationRule": "COUNT(action_type) GROUP BY user_id, action_type"
        }
      ],
      "tags": ["数据聚合", "用户画像", "机器学习"],
      "qualityImpact": "medium",
      "schedule": "daily", 
      "status": "active"
    },
    {
      "id": "lineage_003",
      "sourceAssetId": "asset_005",
      "targetAssetId": "asset_003",
      "sourceAssetName": "用户画像表",
      "targetAssetName": "销售业绩分析报表",
      "relationType": "used_by",
      "transformationType": "reporting",
      "transformationDescription": "结合用户画像数据生成销售业绩分析报表",
      "confidence": 0.88,
      "processName": "sales_report_generation",
      "processId": "job_003", 
      "createTime": "2024-01-12T14:20:00Z",
      "lastUpdateTime": "2024-01-17T09:15:00Z",
      "fieldLevelLineage": [
        {
          "sourceField": "user_id",
          "targetField": "customer_segment",
          "transformationRule": "JOIN WITH order_data ON user_id"
        },
        {
          "sourceField": "behavior_preference", 
          "targetField": "purchase_propensity",
          "transformationRule": "CASE WHEN behavior_preference LIKE '%purchase%' THEN 'high' ELSE 'low' END"
        }
      ],
      "tags": ["报表生成", "业务分析", "销售指标"],
      "qualityImpact": "medium",
      "schedule": "daily",
      "status": "active"
    }
  ],
  "lineageGraph": {
    "nodes": [
      {
        "id": "asset_004",
        "name": "原始用户行为日志表", 
        "type": "source_table",
        "level": 0,
        "x": 100,
        "y": 200
      },
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "type": "processed_table", 
        "level": 1,
        "x": 300,
        "y": 200
      },
      {
        "id": "asset_005",
        "name": "用户画像表",
        "type": "aggregated_table",
        "level": 2,
        "x": 500,
        "y": 150
      },
      {
        "id": "asset_003",
        "name": "销售业绩分析报表",
        "type": "report",
        "level": 3,
        "x": 700,
        "y": 200
      }
    ],
    "edges": [
      {
        "id": "edge_001",
        "source": "asset_004",
        "target": "asset_001", 
        "type": "etl_process",
        "weight": 0.95
      },
      {
        "id": "edge_002", 
        "source": "asset_001",
        "target": "asset_005",
        "type": "aggregation",
        "weight": 0.92
      },
      {
        "id": "edge_003",
        "source": "asset_005",
        "target": "asset_003",
        "type": "reporting",
        "weight": 0.88
      }
    ]
  }
}
```

## 5. 质量数据结构

### 📊 **quality.json**
```json
{
  "qualityReports": [
    {
      "id": "quality_001",
      "assetId": "asset_001",
      "assetName": "用户行为分析表",
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
        },
        "consistency": {
          "score": 96,
          "description": "数据一致性",
          "details": "字段约束满足率96%"
        },
        "timeliness": {
          "score": 92,
          "description": "数据时效性",
          "details": "数据更新及时率92%"
        },
        "validity": {
          "score": 95,
          "description": "数据有效性",
          "details": "数据规则通过率95%"
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
          "description": "检查用户ID字段是否存在空值",
          "severity": "critical"
        },
        {
          "id": "rule_002", 
          "name": "行为类型枚举检查",
          "type": "enum_validation",
          "field": "action_type",
          "status": "warning",
          "passRate": 94.2,
          "failureCount": 71653,
          "totalCount": 1234567,
          "description": "检查行为类型是否在预定义范围内",
          "severity": "medium",
          "allowedValues": ["click", "view", "purchase", "search", "login", "logout"]
        },
        {
          "id": "rule_003",
          "name": "时间戳格式检查", 
          "type": "format_validation",
          "field": "timestamp",
          "status": "passed",
          "passRate": 99.8,
          "failureCount": 2469,
          "totalCount": 1234567,
          "description": "检查时间戳字段格式是否正确",
          "severity": "high",
          "pattern": "YYYY-MM-DD HH:MM:SS"
        }
      ],
      "trends": [
        {
          "date": "2024-01-10",
          "score": 93
        },
        {
          "date": "2024-01-11", 
          "score": 94
        },
        {
          "date": "2024-01-12",
          "score": 94
        },
        {
          "date": "2024-01-13",
          "score": 95
        },
        {
          "date": "2024-01-14",
          "score": 96
        },
        {
          "date": "2024-01-15",
          "score": 95
        },
        {
          "date": "2024-01-16",
          "score": 95
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
          "description": "发现未知的行为类型值 'unknown_action'",
          "affectedRows": 71653,
          "detectedTime": "2024-01-17T14:30:00Z",
          "status": "open",
          "suggestion": "建议更新枚举值定义或清洗异常数据"
        }
      ]
    }
  ]
}
```

## 6. 统计数据结构

### 📈 **statistics.json**
```json
{
  "dashboard": {
    "updateTime": "2024-01-17T17:00:00Z",
    "summary": {
      "totalAssets": {
        "current": 1234,
        "trend": 12,
        "trendType": "increase",
        "percentage": 1.0
      },
      "totalTables": {
        "current": 856,
        "trend": 23,
        "trendType": "increase", 
        "percentage": 2.8
      },
      "totalModels": {
        "current": 378,
        "trend": 45,
        "trendType": "increase",
        "percentage": 13.5
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
        },
        {
          "type": "model", 
          "name": "数据模型",
          "count": 378,
          "percentage": 30.6
        },
        {
          "type": "report",
          "name": "报表",
          "count": 142,
          "percentage": 11.5
        },
        {
          "type": "dashboard",
          "name": "看板", 
          "count": 89,
          "percentage": 7.2
        }
      ],
      "byDepartment": [
        {
          "department": "数据团队",
          "count": 456,
          "percentage": 37.0
        },
        {
          "department": "业务团队",
          "count": 378,
          "percentage": 30.6
        },
        {
          "department": "销售团队", 
          "count": 234,
          "percentage": 19.0
        },
        {
          "department": "技术团队",
          "count": 166,
          "percentage": 13.4
        }
      ]
    },
    "accessTrends": {
      "daily": [
        {
          "date": "2024-01-10",
          "accessCount": 2456
        },
        {
          "date": "2024-01-11",
          "accessCount": 2678
        },
        {
          "date": "2024-01-12", 
          "accessCount": 2234
        },
        {
          "date": "2024-01-13",
          "accessCount": 2890
        },
        {
          "date": "2024-01-14",
          "accessCount": 2345
        },
        {
          "date": "2024-01-15",
          "accessCount": 3456
        },
        {
          "date": "2024-01-16",
          "accessCount": 3234
        },
        {
          "date": "2024-01-17",
          "accessCount": 3567
        }
      ]
    },
    "qualityTrends": {
      "weekly": [
        {
          "week": "2024-W01",
          "avgScore": 93.2
        },
        {
          "week": "2024-W02", 
          "avgScore": 94.1
        },
        {
          "week": "2024-W03",
          "avgScore": 95.0
        }
      ]
    },
    "topAssets": [
      {
        "id": "asset_001",
        "name": "用户行为分析表",
        "accessCount": 1234,
        "qualityScore": 95
      },
      {
        "id": "asset_002",
        "name": "订单数据模型", 
        "accessCount": 1156,
        "qualityScore": 92
      },
      {
        "id": "asset_003",
        "name": "销售业绩分析报表",
        "accessCount": 567,
        "qualityScore": 88
      }
    ]
  }
}
```

## 7. 用户信息数据结构

### 👥 **users.json**
```json
{
  "users": [
    {
      "id": "user_001",
      "username": "zhangsan",
      "name": "张三",
      "email": "zhangsan@company.com",
      "department": "数据团队",
      "role": "data_engineer",
      "roleName": "数据工程师",
      "avatar": "/avatars/zhangsan.jpg",
      "phone": "13812345678",
      "status": "active",
      "createTime": "2023-06-15T09:00:00Z",
      "lastLoginTime": "2024-01-17T08:30:00Z",
      "permissions": [
        "asset.read",
        "asset.create",
        "asset.edit",
        "quality.view",
        "lineage.view"
      ],
      "ownedAssets": [
        "asset_001",
        "asset_007",
        "asset_012"
      ],
      "recentActivities": [
        {
          "action": "edit_asset",
          "assetId": "asset_001", 
          "timestamp": "2024-01-17T14:30:00Z"
        },
        {
          "action": "view_lineage",
          "assetId": "asset_001",
          "timestamp": "2024-01-17T13:45:00Z"
        }
      ]
    },
    {
      "id": "user_002", 
      "username": "lisi",
      "name": "李四",
      "email": "lisi@company.com",
      "department": "业务团队",
      "role": "business_analyst",
      "roleName": "业务分析师",
      "avatar": "/avatars/lisi.jpg",
      "phone": "13823456789",
      "status": "active", 
      "createTime": "2023-08-20T10:30:00Z",
      "lastLoginTime": "2024-01-17T09:15:00Z",
      "permissions": [
        "asset.read",
        "asset.edit",
        "report.create",
        "report.edit",
        "quality.view"
      ],
      "ownedAssets": [
        "asset_002",
        "asset_008", 
        "asset_015"
      ],
      "recentActivities": [
        {
          "action": "create_report",
          "assetId": "asset_008",
          "timestamp": "2024-01-17T11:20:00Z"
        }
      ]
    },
    {
      "id": "user_003",
      "username": "wangwu",
      "name": "王五",
      "email": "wangwu@company.com", 
      "department": "销售团队",
      "role": "sales_manager",
      "roleName": "销售经理",
      "avatar": "/avatars/wangwu.jpg",
      "phone": "13834567890",
      "status": "active",
      "createTime": "2023-09-10T14:20:00Z",
      "lastLoginTime": "2024-01-17T16:45:00Z",
      "permissions": [
        "asset.read", 
        "report.read",
        "dashboard.view"
      ],
      "ownedAssets": [
        "asset_003",
        "asset_009"
      ],
      "recentActivities": [
        {
          "action": "view_report",
          "assetId": "asset_003",
          "timestamp": "2024-01-17T16:45:00Z"
        }
      ]
    }
  ]
}
```

## 8. 活动日志数据结构

### 📝 **activities.json**
```json
{
  "activities": [
    {
      "id": "activity_001",
      "userId": "user_001",
      "userName": "张三",
      "action": "edit_asset",
      "actionName": "编辑资产",
      "targetType": "asset",
      "targetId": "asset_001",
      "targetName": "用户行为分析表", 
      "description": "更新了资产描述信息",
      "timestamp": "2024-01-17T14:30:00Z",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "details": {
        "changes": [
          {
            "field": "description",
            "oldValue": "记录用户行为数据",
            "newValue": "记录用户在平台上的各种行为数据，包括页面访问、点击事件等"
          }
        ]
      },
      "status": "success"
    },
    {
      "id": "activity_002",
      "userId": "user_002",
      "userName": "李四", 
      "action": "create_asset",
      "actionName": "创建资产",
      "targetType": "asset",
      "targetId": "asset_020",
      "targetName": "客户满意度调研表",
      "description": "创建了新的数据表资产",
      "timestamp": "2024-01-17T11:20:00Z",
      "ip": "192.168.1.101",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "details": {
        "assetType": "table",
        "database": "survey_system", 
        "initialFields": 8
      },
      "status": "success"
    },
    {
      "id": "activity_003",
      "userId": "user_003",
      "userName": "王五",
      "action": "view_lineage",
      "actionName": "查看血缘",
      "targetType": "asset",
      "targetId": "asset_003",
      "targetName": "销售业绩分析报表",
      "description": "查看了数据血缘关系",
      "timestamp": "2024-01-17T16:45:00Z",
      "ip": "192.168.1.102", 
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "details": {
        "lineageDirection": "both",
        "maxDepth": 3
      },
      "status": "success"
    },
    {
      "id": "activity_004",
      "userId": "user_001",
      "userName": "张三",
      "action": "run_quality_check",
      "actionName": "执行质量检查",
      "targetType": "asset", 
      "targetId": "asset_001",
      "targetName": "用户行为分析表",
      "description": "执行了数据质量检查",
      "timestamp": "2024-01-17T15:30:00Z",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "details": {
        "rulesExecuted": 5,
        "overallScore": 95,
        "issuesFound": 1
      },
      "status": "success"
    },
    {
      "id": "activity_005", 
      "userId": "user_002",
      "userName": "李四",
      "action": "export_data",
      "actionName": "导出数据",
      "targetType": "asset",
      "targetId": "asset_002",
      "targetName": "订单数据模型",
      "description": "导出了数据样本",
      "timestamp": "2024-01-17T13:15:00Z",
      "ip": "192.168.1.101",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "details": {
        "format": "csv",
        "rowCount": 1000,
        "fileSize": "2.5MB"
      },
      "status": "success"
    }
  ]
}
```

## 9. API接口设计

### 🔗 **API端点定义**

```typescript
// API基础配置
const API_BASE_URL = 'http://localhost:3001/api'

// 主要API端点
interface APIEndpoints {
  // 资产相关
  assets: '/assets',
  assetDetail: '/assets/:id',
  assetFields: '/assets/:id/fields',
  assetLineage: '/assets/:id/lineage',
  assetQuality: '/assets/:id/quality',
  
  // 搜索相关
  search: '/search',
  searchSuggestions: '/search/suggestions',
  
  // 统计相关
  statistics: '/statistics',
  dashboard: '/dashboard',
  
  // 用户相关
  users: '/users',
  userProfile: '/users/:id',
  userActivities: '/users/:id/activities',
  
  // 活动日志
  activities: '/activities',
  recentActivities: '/activities/recent'
}

// 请求响应格式
interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
```

## 10. 数据文件组织结构

### 📁 **public/data/ 目录结构**
```
public/
├── data/
│   ├── assets.json          # 资产基础信息
│   ├── fields.json          # 字段详情信息  
│   ├── lineage.json         # 血缘关系数据
│   ├── quality.json         # 质量检查数据
│   ├── users.json           # 用户信息数据
│   ├── statistics.json      # 统计概览数据
│   ├── activities.json      # 活动日志数据
│   └── index.json          # 数据索引文件
└── images/
    ├── avatars/            # 用户头像
    ├── icons/              # 图标资源
    └── charts/             # 图表相关图片
```

### 📋 **index.json (数据索引)**
```json
{
  "dataVersion": "1.0.0",
  "lastUpdate": "2024-01-17T17:00:00Z",
  "files": {
    "assets": {
      "file": "assets.json",
      "records": 20,
      "size": "45KB",
      "checksum": "a1b2c3d4e5f6"
    },
    "fields": {
      "file": "fields.json", 
      "records": 100,
      "size": "28KB",
      "checksum": "b2c3d4e5f6g7"
    },
    "lineage": {
      "file": "lineage.json",
      "records": 15,
      "size": "12KB", 
      "checksum": "c3d4e5f6g7h8"
    },
    "quality": {
      "file": "quality.json",
      "records": 20,
      "size": "18KB",
      "checksum": "d4e5f6g7h8i9"
    },
    "users": {
      "file": "users.json",
      "records": 10,
      "size": "8KB",
      "checksum": "e5f6g7h8i9j0"
    },
    "statistics": {
      "file": "statistics.json", 
      "records": 1,
      "size": "6KB",
      "checksum": "f6g7h8i9j0k1"
    },
    "activities": {
      "file": "activities.json",
      "records": 50,
      "size": "15KB",
      "checksum": "g7h8i9j0k1l2"
    }
  }
}
```

这套Mock数据结构涵盖了MVP演示的所有核心场景，提供了丰富而真实的演示数据，支持前端开发团队快速构建功能完整的原型系统。 