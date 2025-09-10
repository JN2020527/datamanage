import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Breadcrumb,
  Badge,
  Drawer,
  Space,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SearchOutlined,
  BuildOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppStore } from '@store/useAppStore';
import type { MenuItem } from '@types/index';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

// 主导航菜单配置
const mainMenuItems: MenuItem[] = [
  {
    key: 'home',
    label: '首页',
    icon: <HomeOutlined />,
    path: '/',
  },
  {
    key: 'discovery',
    label: '资产发现',
    icon: <SearchOutlined />,
    path: '/discovery',
  },
  {
    key: 'development',
    label: '资产开发',
    icon: <BuildOutlined />,
    path: '/development',
  },
  {
    key: 'governance',
    label: '资产治理',
    icon: <SafetyCertificateOutlined />,
    path: '/governance',
  },
  {
    key: 'analysis',
    label: '敏捷分析',
    icon: <BarChartOutlined />,
    path: '/analysis',
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    path: '/system',
  },
];

// 侧边栏菜单配置
const sideMenuConfig: Record<string, MenuItem[]> = {
  home: [],
  discovery: [
    {
      key: 'discovery-search',
      label: '资产搜索',
      path: '/discovery',
    },
    {
      key: 'discovery-category',
      label: '分类浏览',
      path: '/discovery/category',
    },
  ],
  development: [
    {
      key: 'development-my',
      label: '我的资产',
      path: '/development/my',
    },
    {
      key: 'development-status',
      label: '开发状态',
      children: [
        { key: 'development-developing', label: '开发中', path: '/development/developing' },
        { key: 'development-pending', label: '待审核', path: '/development/pending' },
        { key: 'development-published', label: '已发布', path: '/development/published' },
        { key: 'development-offline', label: '已下线', path: '/development/offline' },
      ],
    },
    {
      key: 'development-template',
      label: '模板管理',
      path: '/development/template',
    },
    {
      key: 'development-version',
      label: '版本管理',
      path: '/development/version',
    },
  ],
  governance: [
    {
      key: 'governance-standard',
      label: '数据标准',
      children: [
        { key: 'governance-naming', label: '命名规范', path: '/governance/naming' },
        { key: 'governance-dictionary', label: '数据字典', path: '/governance/dictionary' },
        { key: 'governance-glossary', label: '业务术语', path: '/governance/glossary' },
      ],
    },
    {
      key: 'governance-quality',
      label: '质量管理',
      children: [
        { key: 'governance-rules', label: '质量规则', path: '/governance/rules' },
        { key: 'governance-reports', label: '质量报告', path: '/governance/reports' },
        { key: 'governance-monitor', label: '质量监控', path: '/governance/monitor' },
      ],
    },
    {
      key: 'governance-security',
      label: '安全管理',
      children: [
        { key: 'governance-access', label: '访问控制', path: '/governance/access' },
        { key: 'governance-sensitive', label: '敏感数据', path: '/governance/sensitive' },
        { key: 'governance-audit', label: '审计日志', path: '/governance/audit' },
      ],
    },
  ],
  analysis: [
    {
      key: 'analysis-preview',
      label: '数据预览',
      path: '/analysis/preview',
    },
    {
      key: 'analysis-chart',
      label: '图表分析',
      path: '/analysis/chart',
    },
    {
      key: 'analysis-report',
      label: '报表设计',
      path: '/analysis/report',
    },
    {
      key: 'analysis-my-reports',
      label: '我的报表',
      path: '/analysis/my-reports',
    },
    {
      key: 'analysis-shared',
      label: '共享报表',
      path: '/analysis/shared',
    },
    {
      key: 'analysis-export',
      label: '数据导出',
      path: '/analysis/export',
    },
  ],
  system: [
    {
      key: 'system-user',
      label: '用户管理',
      children: [
        { key: 'system-users', label: '用户列表', path: '/system/users' },
        { key: 'system-roles', label: '角色管理', path: '/system/roles' },
        { key: 'system-permissions', label: '权限配置', path: '/system/permissions' },
      ],
    },
    {
      key: 'system-config',
      label: '系统配置',
      children: [
        { key: 'system-settings', label: '基础设置', path: '/system/settings' },
        { key: 'system-connections', label: '连接管理', path: '/system/connections' },
        { key: 'system-notifications', label: '通知配置', path: '/system/notifications' },
      ],
    },
    {
      key: 'system-monitor',
      label: '监控运维',
      children: [
        { key: 'system-status', label: '系统状态', path: '/system/status' },
        { key: 'system-performance', label: '性能监控', path: '/system/performance' },
        { key: 'system-logs', label: '日志管理', path: '/system/logs' },
      ],
    },
  ],
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    currentUser,
    activeMenu,
    sidebarCollapsed,
    breadcrumbs,
    setActiveMenu,
    setSidebarCollapsed,
    setBreadcrumbs,
  } = useAppStore();

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarCollapsed]);

  // 根据路径设置当前菜单
  useEffect(() => {
    const path = location.pathname;
    const menuKey = path.split('/')[1] || 'home';
    setActiveMenu(menuKey);

    // 生成面包屑
    const generateBreadcrumbs = () => {
      const segments = path.split('/').filter(Boolean);
      const crumbs = [{ title: '首页', path: '/' }];

      if (segments.length > 0) {
        const mainMenu = mainMenuItems.find(item => item.key === segments[0]);
        if (mainMenu) {
          crumbs.push({ title: mainMenu.label, path: mainMenu.path });
        }

        // 添加子页面面包屑
        if (segments.length > 1) {
          const sideMenus = sideMenuConfig[segments[0]] || [];
          const findSubMenu = (menus: MenuItem[], segment: string): MenuItem | undefined => {
            for (const menu of menus) {
              if (menu.key?.includes(segment)) {
                return menu;
              }
              if (menu.children) {
                const found = findSubMenu(menu.children, segment);
                if (found) return found;
              }
            }
          };

          const subMenu = findSubMenu(sideMenus, segments[1]);
          if (subMenu) {
            crumbs.push({ title: subMenu.label });
          }
        }
      }

      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [location.pathname, setActiveMenu, setBreadcrumbs]);

  // 主导航点击处理
  const handleMainMenuClick = (key: string) => {
    const menuItem = mainMenuItems.find(item => item.key === key);
    if (menuItem?.path) {
      navigate(menuItem.path);
    }
    setActiveMenu(key);
    if (isMobile) {
      setMobileMenuVisible(false);
    }
  };

  // 侧边栏菜单点击处理
  const handleSideMenuClick = ({ key }: { key: string }) => {
    const findMenuByKey = (menus: MenuItem[], targetKey: string): MenuItem | undefined => {
      for (const menu of menus) {
        if (menu.key === targetKey) {
          return menu;
        }
        if (menu.children) {
          const found = findMenuByKey(menu.children, targetKey);
          if (found) return found;
        }
      }
    };

    const sideMenus = sideMenuConfig[activeMenu] || [];
    const menuItem = findMenuByKey(sideMenus, key);
    if (menuItem?.path) {
      navigate(menuItem.path);
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <ProfileOutlined />,
    },
    {
      key: 'settings',
      label: '个人设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 处理登出逻辑
      console.log('用户登出');
    } else {
      navigate(`/${key}`);
    }
  };

  // 渲染侧边栏菜单
  const renderSideMenu = () => {
    const sideMenus = sideMenuConfig[activeMenu] || [];
    if (sideMenus.length === 0) return null;

    const convertToAntdMenuItems = (menus: MenuItem[]): any[] => {
      return menus.map(menu => ({
        key: menu.key,
        label: menu.label,
        icon: menu.icon,
        children: menu.children ? convertToAntdMenuItems(menu.children) : undefined,
      }));
    };

    return (
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={convertToAntdMenuItems(sideMenus)}
        onClick={handleSideMenuClick}
        style={{ borderRight: 0 }}
      />
    );
  };

  return (
    <Layout className="main-layout">
      {/* 顶部导航栏 */}
      <Header className="layout-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">数据资产平台</span>
          </div>
        </div>

        <div className="header-center">
          {!isMobile && (
            <Menu
              mode="horizontal"
              selectedKeys={[activeMenu]}
              items={mainMenuItems.map(item => ({
                key: item.key,
                label: item.label,
                icon: item.icon,
              }))}
              onClick={({ key }) => handleMainMenuClick(key)}
              className="main-menu"
            />
          )}
        </div>

        <div className="header-right">
          <Space size="middle">
            <Badge count={5}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className="header-action-btn"
              />
            </Badge>

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <div className="user-info">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={currentUser?.avatar}
                />
                <span className="username">{currentUser?.name || '用户'}</span>
              </div>
            </Dropdown>

            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                className="mobile-menu-btn"
              />
            )}
          </Space>
        </div>
      </Header>

      <Layout className="layout-body">
        {/* 侧边栏 */}
        {!isMobile && sideMenuConfig[activeMenu]?.length > 0 && (
          <Sider
            trigger={null}
            collapsible
            collapsed={sidebarCollapsed}
            width={280}
            className="layout-sider"
          >
            <div className="sider-header">
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="collapse-btn"
              />
              {!sidebarCollapsed && (
                <span className="sider-title">
                  {mainMenuItems.find(item => item.key === activeMenu)?.label}
                </span>
              )}
            </div>
            <div className="sider-content">
              {renderSideMenu()}
            </div>
          </Sider>
        )}

        {/* 主内容区 */}
        <Layout className="layout-content">
          {/* 面包屑导航 */}
          <div className="breadcrumb-container">
            <Breadcrumb
              items={breadcrumbs.map(crumb => ({
                title: crumb.path ? (
                  <a onClick={() => navigate(crumb.path!)}>{crumb.title}</a>
                ) : (
                  crumb.title
                ),
              }))}
            />
          </div>

          {/* 页面内容 */}
          <Content className="page-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* 移动端菜单抽屉 */}
      {isMobile && (
        <Drawer
          title="导航菜单"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={280}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            items={mainMenuItems.map(item => ({
              key: item.key,
              label: item.label,
              icon: item.icon,
            }))}
            onClick={({ key }) => handleMainMenuClick(key)}
          />
        </Drawer>
      )}
    </Layout>
  );
};

export default MainLayout;
