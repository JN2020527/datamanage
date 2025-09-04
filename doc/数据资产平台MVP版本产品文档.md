# 数据资产平台MVP版本产品文档

## 1. 产品概述

数据资产平台MVP版本专注于核心数据资产管理功能的演示，为用户提供数据发现、基础治理和简单分析能力，帮助用户快速理解数据资产管理的核心价值。

## 2. MVP版本核心功能

### 2.1 资产发现
**功能描述**：提供数据资产的可视化展示和搜索能力

**核心功能**：
- **资产全景地图**：展示数据模型、指标、报表、看板的数量统计和分布情况
- **业务目录**：按业务分类展示数据资产，支持树形结构浏览和快速定位
- **资产详情**：展示数据模型的基本信息、字段详情、负责人、业务用途
- **智能搜索**：支持关键词搜索数据资产，提供搜索建议和联想

**用户价值**：
- 快速了解企业数据资产全貌
- 按业务需求查找相关数据
- 理解数据资产的业务含义

### 2.2 资产开发
**功能描述**：提供数据模型和字段的基础管理能力

**核心功能**：
- **模型创建**：创建数据模型，定义模型类型、描述、业务用途
- **字段管理**：添加、编辑、删除字段，定义字段类型和约束规则
- **血缘关系**：展示数据模型之间的上下游依赖关系
- **版本管理**：记录模型变更历史，支持版本对比

**用户价值**：
- 规范数据模型设计
- 理解数据流转关系
- 追踪数据变更历史

### 2.3 资产治理
**功能描述**：提供基础的数据治理和质量管控能力

**核心功能**：
- **数据标准**：管理字段命名规范、数据字典、业务术语
- **质量检查**：基础的数据质量检查（空值、重复值、格式校验）
- **元数据管理**：管理模型和字段的基础属性信息
- **治理报告**：生成数据质量报告和治理状态统计

**用户价值**：
- 建立数据标准规范
- 提升数据质量
- 统一数据管理

### 2.4 敏捷分析
**功能描述**：提供数据预览和基础分析能力

**核心功能**：
- **数据预览**：以表格形式展示数据内容
- **图表分析**：生成柱状图、饼图、折线图等基础图表
- **报表设计**：拖拽式报表设计器，快速生成分析报表
- **数据导出**：支持数据导出为Excel、CSV等格式

**用户价值**：
- 快速了解数据内容
- 生成基础分析报表
- 支持业务决策

### 2.5 系统管理
**功能描述**：提供基础的用户和权限管理

**核心功能**：
- **用户管理**：用户账号管理、角色分配
- **权限控制**：基础的角色权限控制
- **系统设置**：系统基础配置项管理

**用户价值**：
- 保障系统安全
- 规范用户访问
- 支持多用户协作

## 3. 业务流程演示

### 3.1 数据资产发现流程
1. **进入资产全景** → 查看数据资产总体情况
2. **浏览业务目录** → 按业务分类查找数据
3. **查看资产详情** → 了解具体数据模型信息
4. **使用搜索功能** → 快速定位目标数据

### 3.2 数据模型管理流程
1. **创建数据模型** → 定义模型基本信息
2. **添加字段信息** → 完善模型结构
3. **配置血缘关系** → 建立数据依赖关系
4. **发布模型** → 将模型纳入管理体系

### 3.3 数据质量管控流程
1. **设置质量规则** → 定义数据质量标准
2. **执行质量检查** → 自动检测数据问题
3. **查看质量报告** → 了解数据质量状况
4. **处理质量问题** → 修复数据问题

## 4. 前端技术栈方案

### 4.1 技术栈选型

| 技术分类            | 推荐方案                      | 版本要求 | 选择理由                                   |
| ------------------- | ----------------------------- | -------- | ------------------------------------------ |
| **开发框架**        | **React**                     | 18.x     | 组件化开发，生态成熟，开发效率高           |
| **开发语言**        | **TypeScript**                | 5.x      | 类型安全，智能提示，提升开发体验和代码质量 |
| **UI组件库**        | **Ant Design**                | 5.x      | 企业级UI设计语言，组件丰富，专业视觉效果   |
| **项目构建工具**    | **Vite**                      | 5.x      | 现代化构建工具，启动速度快，热更新流畅     |
| **状态管理**        | **Zustand**                   | 4.x      | 轻量级状态管理，简单易用，满足MVP需求      |
| **路由管理**        | **React Router**              | 6.x      | React生态标准路由方案，功能完善            |
| **数据可视化**      | **@ant-design/charts + G6**   | 最新     | 统一AntV生态，图表丰富，视觉一致性好       |
| **动画效果**        | **Framer Motion**             | 11.x     | 优秀的动画库，提升用户交互体验             |
| **样式解决方案**    | **CSS Modules + Less**        | -        | 编译时处理，性能优秀，与Ant Design集成良好 |
| **Mock数据**        | **JSON Server + MSW**         | 最新     | 快速Mock API，支持复杂数据模拟场景         |
| **开发工具**        | **ESLint + Prettier**         | 最新     | 代码规范检查和格式化，保证代码质量         |

### 4.2 项目依赖配置

#### 4.2.1 生产依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "@ant-design/icons": "^5.2.0",
    "@ant-design/charts": "^2.0.0",
    "@antv/g6": "^4.8.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.4.0",
    "dayjs": "^1.11.0",
    "lodash-es": "^4.17.0",
    "axios": "^1.6.0"
  }
}
```

#### 4.2.2 开发依赖
```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/lodash-es": "^4.17.0",
    "less": "^4.2.0",
    "json-server": "^0.17.0",
    "msw": "^2.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### 4.3 项目结构设计（简化版）

```
data-asset-platform-mvp/
├── public/                     # 静态资源
│   ├── data/                  # Mock数据文件
│   │   ├── assets.json        # 资产数据
│   │   ├── lineage.json       # 血缘关系数据
│   │   └── quality.json       # 质量数据
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/             # 通用组件（扁平化管理）
│   │   ├── Layout.tsx         # 页面布局
│   │   ├── AssetCard.tsx      # 资产卡片
│   │   ├── SearchBox.tsx      # 搜索框
│   │   ├── DataTable.tsx      # 数据表格
│   │   ├── LineageGraph.tsx   # 血缘图谱
│   │   └── ChartContainer.tsx # 图表容器
│   ├── pages/                  # 页面组件
│   │   ├── Discovery.tsx      # 资产发现
│   │   ├── Development.tsx    # 资产开发
│   │   ├── Governance.tsx     # 资产治理
│   │   ├── Analysis.tsx       # 敏捷分析
│   │   └── System.tsx         # 系统管理
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useAssets.ts       # 资产数据hook
│   │   └── useSearch.ts       # 搜索功能hook
│   ├── store/                  # 状态管理
│   │   └── index.ts           # 全局状态
│   ├── utils/                  # 工具函数
│   │   ├── api.ts             # 数据获取
│   │   └── helpers.ts         # 辅助函数
│   ├── types/                  # TypeScript类型
│   │   └── index.ts           # 类型定义
│   ├── styles/                 # 样式文件
│   │   └── globals.css        # 全局样式
│   ├── App.tsx                # 应用根组件
│   └── main.tsx              # 应用入口
├── vite.config.ts             # Vite配置
├── tsconfig.json             # TypeScript配置
├── package.json              # 项目依赖
└── README.md                 # 项目说明
```

#### 结构设计原则（MVP适配）

| 原则         | 说明                                                     |
| ------------ | -------------------------------------------------------- |
| **扁平化**   | 减少目录层级，components下直接放置组件文件               |
| **功能导向** | 按页面功能划分，每个页面一个文件                         |
| **数据分离** | Mock数据放在public/data下，便于快速修改演示数据          |
| **简化管理** | 每个功能模块只建立必要的文件，避免空文件夹               |
| **易于定位** | 文件命名清晰，开发时能快速找到对应文件                   |

### 4.4 核心配置文件

#### 4.4.1 Vite配置 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1677ff',
          '@primary-light': '#4096ff',
          '@primary-dark': '#0958d9',
          '@success-color': '#52c41a',
          '@warning-color': '#faad14',
          '@error-color': '#ff4d4f',
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

#### 4.4.2 TypeScript配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.5 技术栈优势总结

| 优势维度     | 具体表现                                                   |
| ------------ | ---------------------------------------------------------- |
| **开发效率** | Vite快速构建，TypeScript智能提示，Ant Design开箱即用组件  |
| **用户体验** | Framer Motion流畅动画，Ant Design专业UI，响应式设计       |
| **可维护性** | TypeScript类型安全，ESLint代码规范，模块化组件架构        |
| **演示效果** | 丰富的图表库，美观的界面设计，流畅的交互动画               |
| **扩展性**   | 组件化架构，状态管理，标准化的项目结构                     |

### 4.6 快速启动指南

#### 4.6.1 环境准备
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

#### 4.6.2 项目初始化
```bash
# 创建项目
npm create vite@latest data-asset-platform-mvp -- --template react-ts

# 安装依赖
cd data-asset-platform-mvp
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

#### 4.6.3 Mock数据启动
```bash
# 启动JSON Server (另开终端)
npx json-server --watch public/data/db.json --routes public/data/routes.json --port 3001 --host 0.0.0.0
```

## 5. MVP范围边界与只读说明（重要）

- 本MVP以只读为主：资产、字段、血缘、质量、统计、用户、活动日志均提供展示能力。
- 写入能力（资产创建/编辑、字段CRUD、质量规则配置、版本管理等）本期不落地，仅保留页面按钮或入口用于演示动线。
- 若需最小写入闭环，建议采用 MSW 在前端内存态实现请求拦截与本地回显，避免破坏统一Mock数据。

## 6. 前端路由表（建议方案）

- `/` → 首页概览
- `/discovery` → 资产发现
- `/assets/:id` → 资产详情（默认子标签为概览）
- `/assets/:id/fields` → 资产字段
- `/assets/:id/lineage` → 数据血缘
- `/assets/:id/quality` → 质量报告
- `/analysis` → 敏捷分析
- `/system/users` → 用户列表（只读）

## 7. 统一类型清单（前端 types 摘要）

- `APIResponse<T>`、`PaginatedResponse<T>`
- `Asset`、`Field`
- `LineageNode`、`LineageEdge`
- `QualityReport`、`QualityRule`、`QualityTrend`、`QualityIssue`
- `DashboardStatistics`、`ChartDatum`
- `User`、`UserActivity`

时间字段统一为 ISO 8601 字符串。

## 8. 交互状态与性能默认

- 列表 `pageSize` 默认 20，最大 100。
- 图表数据点默认不超过 500；超出采用抽样或分页加载。
- 血缘视图默认方向 `both`，最大深度 3。
- 统一加载骨架、空态与错误态：所有页面组件均提供 loading/empty/error 三态显示。

## 9. 启动脚本与代理

package.json 建议：
```json
{
  "scripts": {
    "dev": "vite",
    "mock": "json-server --watch public/data/db.json --routes public/data/routes.json --port 3001 --host 0.0.0.0"
  }
}
```

`vite.config.ts` 代理：
```ts
server: {
  port: 3000,
  open: true,
  proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
}
```

## 10. 验收清单（用于演示）

- 首页：摘要卡片、类型分布、访问与质量趋势、热门资产、最近活动可见
- 资产发现：搜索/建议、筛选、卡片/列表切换、分页可用
- 资产详情：概览/字段/血缘/质量标签页数据完整，血缘交互可点选节点
- 质量检查：触发后显示“运行中/完成”反馈（Mock）
- 系统-用户：列表与详情只读展示
