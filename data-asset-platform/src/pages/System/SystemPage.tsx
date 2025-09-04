import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Badge,
  List,
  Avatar,
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  MailOutlined,
  BellOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserManagement from '@components/System/UserManagement';
import RoleManagement from '@components/System/RoleManagement';
import SystemSettings from '@components/System/SystemSettings';
import OperationLogs from '@components/System/OperationLogs';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;

const SystemPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 24,
    activeUsers: 18,
    totalRoles: 6,
    systemRoles: 2,
    todayLogins: 45,
    securityAlerts: 3,
    systemHealth: 98.5,
    databaseStatus: 'healthy',
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      user: '张三',
      action: '创建了新用户',
      target: '李四',
      time: '5分钟前',
      type: 'create',
    },
    {
      id: '2',
      user: '系统管理员',
      action: '修改了系统配置',
      target: '邮件设置',
      time: '15分钟前',
      type: 'update',
    },
    {
      id: '3',
      user: '王五',
      action: '分配了角色权限',
      target: '数据分析师',
      time: '1小时前',
      type: 'assign',
    },
    {
      id: '4',
      user: '赵六',
      action: '导出了操作日志',
      target: '9月份日志',
      time: '2小时前',
      type: 'export',
    },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: '1',
      level: 'warning',
      message: '检测到3次失败登录尝试',
      time: '10分钟前',
    },
    {
      id: '2',
      level: 'info',
      message: '系统备份已完成',
      time: '2小时前',
    },
    {
      id: '3',
      level: 'success',
      message: '安全扫描通过',
      time: '4小时前',
    },
  ]);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // 模拟加载系统统计数据
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('加载系统统计失败');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <UserOutlined style={{ color: '#52c41a' }} />;
      case 'update': return <SettingOutlined style={{ color: '#1890ff' }} />;
      case 'assign': return <TeamOutlined style={{ color: '#722ed1' }} />;
      case 'export': return <FileTextOutlined style={{ color: '#faad14' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getAlertType = (level: string) => {
    switch (level) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const renderOverview = () => (
    <div>
      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={`/ ${stats.activeUsers} 活跃`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={stats.totalRoles}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.systemRoles} 系统`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日登录"
              value={stats.todayLogins}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统健康度"
              value={stats.systemHealth}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="系统健康度" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>CPU使用率</Text>
                <Progress percent={45} size="small" />
              </div>
              <div>
                <Text>内存使用率</Text>
                <Progress percent={68} size="small" />
              </div>
              <div>
                <Text>磁盘使用率</Text>
                <Progress percent={52} size="small" />
              </div>
              <div>
                <Text>网络延迟</Text>
                <Progress percent={15} size="small" status="success" />
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="服务状态" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <DatabaseOutlined />
                  <Text>数据库服务</Text>
                </Space>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <CloudOutlined />
                  <Text>缓存服务</Text>
                </Space>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <MailOutlined />
                  <Text>邮件服务</Text>
                </Space>
                <Badge status="warning" text="警告" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <BellOutlined />
                  <Text>通知服务</Text>
                </Space>
                <Badge status="success" text="正常" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近活动和系统告警 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="最近活动" size="small">
            <List
              size="small"
              dataSource={recentActivities}
              renderItem={activity => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getActivityIcon(activity.type)}
                    title={
                      <Space>
                        <Text strong>{activity.user}</Text>
                        <Text>{activity.action}</Text>
                        <Text type="secondary">{activity.target}</Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activity.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系统告警" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {systemAlerts.map(alert => (
                <Alert
                  key={alert.id}
                  message={alert.message}
                  description={alert.time}
                  type={getAlertType(alert.level) as any}
                  showIcon
                  icon={getAlertIcon(alert.level)}
                  size="small"
                />
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="page-container">
      {/* 面包屑导航 */}
      

      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <SettingOutlined /> 系统管理
        </Title>
        <Text type="secondary">
          管理用户、角色、权限和系统配置，监控系统运行状态
        </Text>
      </div>

      {/* 主要内容区域 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <DatabaseOutlined />
                系统概览
              </Space>
            ),
            children: renderOverview(),
          },
          {
            key: 'users',
            label: (
              <Space>
                <UserOutlined />
                用户管理
              </Space>
            ),
            children: <UserManagement />,
          },
          {
            key: 'roles',
            label: (
              <Space>
                <TeamOutlined />
                角色权限
              </Space>
            ),
            children: <RoleManagement />,
          },
          {
            key: 'settings',
            label: (
              <Space>
                <SettingOutlined />
                系统设置
              </Space>
            ),
            children: <SystemSettings />,
          },
          {
            key: 'logs',
            label: (
              <Space>
                <FileTextOutlined />
                操作日志
              </Space>
            ),
            children: <OperationLogs />,
          },
        ]}
      />
    </div>
  );
};

export default SystemPage;
