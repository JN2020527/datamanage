import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@components/Layout/MainLayout';
import HomePage from '@pages/Home/HomePage';
import DiscoveryPage from '@pages/Discovery/DiscoveryPage';
import AssetDetailPage from '@pages/Discovery/AssetDetailPage';
import DevelopmentPage from '@pages/Development/DevelopmentPage';
import MyAssetsPage from '@pages/Development/MyAssetsPage';
import GovernancePage from '@pages/Governance/GovernancePage';
import AnalysisPage from '@pages/Analysis/AnalysisPage';
import SelfServicePage from '@pages/Analysis/SelfServicePage';
import DashboardPage from '@pages/Analysis/DashboardPage';
import TestDashboard from '@pages/Analysis/TestDashboard';
import SimpleDashboardPage from '@pages/Analysis/SimpleDashboardPage';
import SystemPage from '@pages/System/SystemPage';
import CatalogManagement from '@components/System/CatalogManagement';
import WordRootManagement from '@components/Governance/WordRootManagement';
import FieldManagement from '@components/Governance/FieldManagement';

// 创建路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'discovery',
        children: [
          {
            index: true,
            element: <DiscoveryPage />,
          },
          {
            path: ':id',
            element: <AssetDetailPage />,
          },
          {
            path: 'category',
            element: <div>分类浏览页面 - 开发中</div>,
          },
        ],
      },
      {
        path: 'development',
        children: [
          {
            index: true,
            element: <DevelopmentPage />,
          },
          {
            path: 'my',
            element: <MyAssetsPage />,
          },
          {
            path: 'developing',
            element: <div>开发中资产 - 开发中</div>,
          },
          {
            path: 'pending',
            element: <div>待审核资产 - 开发中</div>,
          },
          {
            path: 'published',
            element: <div>已发布资产 - 开发中</div>,
          },
          {
            path: 'offline',
            element: <div>已下线资产 - 开发中</div>,
          },
          {
            path: 'template',
            element: <div>模板管理 - 开发中</div>,
          },
          {
            path: 'version',
            element: <div>版本管理 - 开发中</div>,
          },
        ],
      },
      {
        path: 'governance',
        children: [
          {
            index: true,
            element: <GovernancePage />,
          },
          {
            path: 'naming',
            element: <div>命名规范 - 开发中</div>,
          },
          {
            path: 'dictionary',
            element: <div>数据字典 - 开发中</div>,
          },
          {
            path: 'glossary',
            element: <div>业务术语 - 开发中</div>,
          },
          {
            path: 'wordroot',
            element: <WordRootManagement />,
          },
          {
            path: 'field',
            element: <FieldManagement />,
          },
          {
            path: 'rules',
            element: <div>质量规则 - 开发中</div>,
          },
          {
            path: 'reports',
            element: <div>质量报告 - 开发中</div>,
          },
          {
            path: 'monitor',
            element: <div>质量监控 - 开发中</div>,
          },
          {
            path: 'access',
            element: <div>访问控制 - 开发中</div>,
          },
          {
            path: 'sensitive',
            element: <div>敏感数据 - 开发中</div>,
          },
          {
            path: 'audit',
            element: <div>审计日志 - 开发中</div>,
          },
        ],
      },
      {
        path: 'analysis',
        children: [
          {
            index: true,
            element: <AnalysisPage />,
          },
          {
            path: 'self-service',
            element: <SelfServicePage />,
          },
          {
            path: 'dashboard',
            element: <SimpleDashboardPage />,
          },
          {
            path: 'preview',
            element: <div>数据预览 - 开发中</div>,
          },
          {
            path: 'chart',
            element: <div>图表分析 - 开发中</div>,
          },
          {
            path: 'report',
            element: <div>报表设计 - 开发中</div>,
          },
          {
            path: 'my-reports',
            element: <div>我的报表 - 开发中</div>,
          },
          {
            path: 'shared',
            element: <div>共享报表 - 开发中</div>,
          },
          {
            path: 'export',
            element: <div>数据导出 - 开发中</div>,
          },
        ],
      },
      {
        path: 'system',
        children: [
          {
            index: true,
            element: <SystemPage />,
          },
          {
            path: 'catalog',
            element: <CatalogManagement />,
          },
          {
            path: 'users',
            element: <div>用户列表 - 开发中</div>,
          },
          {
            path: 'roles',
            element: <div>角色管理 - 开发中</div>,
          },
          {
            path: 'permissions',
            element: <div>权限配置 - 开发中</div>,
          },
          {
            path: 'settings',
            element: <div>基础设置 - 开发中</div>,
          },
          {
            path: 'connections',
            element: <div>连接管理 - 开发中</div>,
          },
          {
            path: 'notifications',
            element: <div>通知配置 - 开发中</div>,
          },
          {
            path: 'status',
            element: <div>系统状态 - 开发中</div>,
          },
          {
            path: 'performance',
            element: <div>性能监控 - 开发中</div>,
          },
          {
            path: 'logs',
            element: <div>日志管理 - 开发中</div>,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
