import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Tabs,
  Upload,
  Select,
  Alert,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Tooltip,
  Progress,
  Table,
  Badge,
  Modal,
  message,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  SettingOutlined,
  DatabaseOutlined,
  MailOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CloudOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SystemConfig {
  // 基本设置
  basic: {
    siteName: string;
    siteDescription: string;
    logo: string;
    favicon: string;
    timezone: string;
    language: string;
    dateFormat: string;
    theme: string;
  };
  // 数据库设置
  database: {
    connectionPool: number;
    queryTimeout: number;
    cacheEnabled: boolean;
    cacheTimeout: number;
    backupEnabled: boolean;
    backupSchedule: string;
  };
  // 邮件设置
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  // 通知设置
  notification: {
    enableEmail: boolean;
    enableSms: boolean;
    enableWebPush: boolean;
    qualityAlerts: boolean;
    systemAlerts: boolean;
    userActivities: boolean;
  };
  // 安全设置
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
    auditLog: boolean;
  };
  // 存储设置
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    storageProvider: string;
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  };
}

interface SystemStatus {
  system: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    version: string;
    lastRestart: string;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    responseTime: number;
    diskUsage: number;
  };
  cache: {
    status: 'healthy' | 'warning' | 'error';
    hitRate: number;
    memoryUsage: number;
    size: number;
  };
  storage: {
    totalSpace: number;
    usedSpace: number;
    freeSpace: number;
    usagePercentage: number;
  };
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    basic: {
      siteName: '政企目录',
      siteDescription: '企业级数据资产管理平台',
      logo: '',
      favicon: '',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light',
    },
    database: {
      connectionPool: 50,
      queryTimeout: 30000,
      cacheEnabled: true,
      cacheTimeout: 3600,
      backupEnabled: true,
      backupSchedule: '0 2 * * *',
    },
    email: {
      enabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: '',
      fromName: '政企目录',
    },
    notification: {
      enableEmail: true,
      enableSms: false,
      enableWebPush: true,
      qualityAlerts: true,
      systemAlerts: true,
      userActivities: false,
    },
    security: {
      sessionTimeout: 7200,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      twoFactorAuth: false,
      ipWhitelist: [],
      auditLog: true,
    },
    storage: {
      maxFileSize: 100,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      storageProvider: 'local',
    },
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    system: {
      status: 'healthy',
      uptime: '15天 8小时 32分钟',
      version: '1.0.0',
      lastRestart: '2024-08-20 14:30:00',
    },
    database: {
      status: 'connected',
      connections: 25,
      responseTime: 12,
      diskUsage: 68,
    },
    cache: {
      status: 'healthy',
      hitRate: 94.5,
      memoryUsage: 512,
      size: 1024,
    },
    storage: {
      totalSpace: 1000,
      usedSpace: 420,
      freeSpace: 580,
      usagePercentage: 42,
    },
  });

  const [loading, setLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadSystemConfig();
    loadSystemStatus();
  }, []);

  const loadSystemConfig = async () => {
    try {
      // 模拟加载配置
      await new Promise(resolve => setTimeout(resolve, 500));
      form.setFieldsValue(config);
    } catch (error) {
      showError('加载系统配置失败');
    }
  };

  const loadSystemStatus = async () => {
    try {
      // 模拟加载系统状态
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      showError('加载系统状态失败');
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfig({ ...config, ...values });
      showSuccess('系统配置保存成功');
    } catch (error) {
      showError('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('测试邮件发送成功');
    } catch (error) {
      showError('测试邮件发送失败');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleResetConfig = () => {
    Modal.confirm({
      title: '确定要重置配置吗？',
      content: '重置后所有配置将恢复为默认值，此操作不可撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          // 模拟重置配置
          await new Promise(resolve => setTimeout(resolve, 1000));
          form.resetFields();
          showSuccess('配置重置成功');
        } catch (error) {
          showError('重置失败');
        }
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
      case 'disconnected':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return '#52c41a';
    if (percentage < 80) return '#faad14';
    return '#ff4d4f';
  };

  const renderBasicSettings = () => (
    <Card title="基本设置">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="网站名称"
            name={['basic', 'siteName']}
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="输入网站名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="时区"
            name={['basic', 'timezone']}
            rules={[{ required: true, message: '请选择时区' }]}
          >
            <Select>
              <Select.Option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</Select.Option>
              <Select.Option value="America/New_York">America/New_York (UTC-5)</Select.Option>
              <Select.Option value="Europe/London">Europe/London (UTC+0)</Select.Option>
              <Select.Option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="网站描述"
        name={['basic', 'siteDescription']}
      >
        <TextArea rows={3} placeholder="输入网站描述" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="语言"
            name={['basic', 'language']}
          >
            <Select>
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="en-US">English</Select.Option>
              <Select.Option value="ja-JP">日本語</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="日期格式"
            name={['basic', 'dateFormat']}
          >
            <Select>
              <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
              <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
              <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="主题"
            name={['basic', 'theme']}
          >
            <Select>
              <Select.Option value="light">浅色主题</Select.Option>
              <Select.Option value="dark">深色主题</Select.Option>
              <Select.Option value="auto">自动切换</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="网站Logo">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传Logo</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="网站图标">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图标</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderDatabaseSettings = () => (
    <Card title="数据库设置">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="连接池大小"
            name={['database', 'connectionPool']}
            rules={[{ required: true, message: '请输入连接池大小' }]}
          >
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="查询超时时间(ms)"
            name={['database', 'queryTimeout']}
            rules={[{ required: true, message: '请输入查询超时时间' }]}
          >
            <InputNumber min={1000} max={300000} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="启用缓存"
            name={['database', 'cacheEnabled']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="缓存超时时间(秒)"
            name={['database', 'cacheTimeout']}
          >
            <InputNumber min={60} max={86400} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="启用自动备份"
            name={['database', 'backupEnabled']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="备份计划 (Cron)"
            name={['database', 'backupSchedule']}
          >
            <Input placeholder="0 2 * * * (每天凌晨2点)" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderEmailSettings = () => (
    <Card title="邮件设置">
      <Form.Item
        label="启用邮件服务"
        name={['email', 'enabled']}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="SMTP服务器"
            name={['email', 'smtpHost']}
          >
            <Input placeholder="smtp.example.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="SMTP端口"
            name={['email', 'smtpPort']}
          >
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="SMTP用户名"
            name={['email', 'smtpUser']}
          >
            <Input placeholder="输入用户名" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="SMTP密码"
            name={['email', 'smtpPassword']}
          >
            <Input.Password placeholder="输入密码" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="启用SSL/TLS"
            name={['email', 'smtpSecure']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="发件人邮箱"
            name={['email', 'fromEmail']}
          >
            <Input placeholder="noreply@example.com" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="发件人名称"
            name={['email', 'fromName']}
          >
            <Input placeholder="政企目录" />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Button 
          icon={<MailOutlined />} 
          onClick={handleTestEmail}
          loading={testEmailLoading}
        >
          发送测试邮件
        </Button>
      </div>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card title="通知设置">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="邮件通知"
            name={['notification', 'enableEmail']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="短信通知"
            name={['notification', 'enableSms']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="浏览器推送"
            name={['notification', 'enableWebPush']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Divider>通知类型</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="质量告警"
            name={['notification', 'qualityAlerts']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="系统告警"
            name={['notification', 'systemAlerts']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="用户活动"
            name={['notification', 'userActivities']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card title="安全设置">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="会话超时时间(秒)"
            name={['security', 'sessionTimeout']}
          >
            <InputNumber min={300} max={86400} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="最大登录尝试次数"
            name={['security', 'maxLoginAttempts']}
          >
            <InputNumber min={3} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="密码最小长度"
            name={['security', 'passwordMinLength']}
          >
            <InputNumber min={6} max={32} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="密码需要特殊字符"
            name={['security', 'passwordRequireSpecial']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="启用双因子认证"
            name={['security', 'twoFactorAuth']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="启用审计日志"
            name={['security', 'auditLog']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="IP白名单">
        <TextArea 
          rows={4} 
          placeholder="每行一个IP地址或IP段，例如：&#10;192.168.1.1&#10;192.168.1.0/24" 
        />
      </Form.Item>
    </Card>
  );

  const renderStorageSettings = () => (
    <Card title="存储设置">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="最大文件大小(MB)"
            name={['storage', 'maxFileSize']}
          >
            <InputNumber min={1} max={1024} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="存储提供商"
            name={['storage', 'storageProvider']}
          >
            <Select>
              <Select.Option value="local">本地存储</Select.Option>
              <Select.Option value="s3">Amazon S3</Select.Option>
              <Select.Option value="oss">阿里云OSS</Select.Option>
              <Select.Option value="cos">腾讯云COS</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="允许的文件类型">
        <Select
          mode="tags"
          placeholder="输入文件扩展名"
          style={{ width: '100%' }}
        >
          <Select.Option value="jpg">jpg</Select.Option>
          <Select.Option value="png">png</Select.Option>
          <Select.Option value="pdf">pdf</Select.Option>
          <Select.Option value="doc">doc</Select.Option>
          <Select.Option value="xls">xls</Select.Option>
        </Select>
      </Form.Item>
    </Card>
  );

  const renderSystemStatus = () => (
    <Card title="系统状态">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                {getStatusIcon(systemStatus.system.status)}
                <Text strong>系统状态</Text>
              </Space>
              <Badge status={getStatusColor(systemStatus.system.status)} text="运行正常" />
              <Text type="secondary">版本: {systemStatus.system.version}</Text>
              <Text type="secondary">运行时间: {systemStatus.system.uptime}</Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <DatabaseOutlined style={{ color: '#1890ff' }} />
                <Text strong>数据库</Text>
              </Space>
              <Badge status={getStatusColor(systemStatus.database.status)} text="连接正常" />
              <Text type="secondary">连接数: {systemStatus.database.connections}</Text>
              <Text type="secondary">响应时间: {systemStatus.database.responseTime}ms</Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <CloudOutlined style={{ color: '#52c41a' }} />
                <Text strong>缓存</Text>
              </Space>
              <Badge status={getStatusColor(systemStatus.cache.status)} text="运行正常" />
              <Text type="secondary">命中率: {systemStatus.cache.hitRate}%</Text>
              <Text type="secondary">内存使用: {systemStatus.cache.memoryUsage}MB</Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <GlobalOutlined style={{ color: '#faad14' }} />
                <Text strong>存储</Text>
              </Space>
              <Progress 
                percent={systemStatus.storage.usagePercentage} 
                size="small"
                strokeColor={getUsageColor(systemStatus.storage.usagePercentage)}
              />
              <Text type="secondary">
                已用: {systemStatus.storage.usedSpace}GB / {systemStatus.storage.totalSpace}GB
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <SettingOutlined /> 系统设置
          </Title>
          <Text type="secondary">
            配置系统参数、安全策略和通知规则
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadSystemConfig}>
              重新加载
            </Button>
            <Button danger onClick={handleResetConfig}>
              重置配置
            </Button>
          </Space>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={config}
      >
        <Tabs
          items={[
            {
              key: 'status',
              label: (
                <Space>
                  <InfoCircleOutlined />
                  系统状态
                </Space>
              ),
              children: renderSystemStatus(),
            },
            {
              key: 'basic',
              label: (
                <Space>
                  <SettingOutlined />
                  基本设置
                </Space>
              ),
              children: renderBasicSettings(),
            },
            {
              key: 'database',
              label: (
                <Space>
                  <DatabaseOutlined />
                  数据库
                </Space>
              ),
              children: renderDatabaseSettings(),
            },
            {
              key: 'email',
              label: (
                <Space>
                  <MailOutlined />
                  邮件设置
                </Space>
              ),
              children: renderEmailSettings(),
            },
            {
              key: 'notification',
              label: (
                <Space>
                  <BellOutlined />
                  通知设置
                </Space>
              ),
              children: renderNotificationSettings(),
            },
            {
              key: 'security',
              label: (
                <Space>
                  <SecurityScanOutlined />
                  安全设置
                </Space>
              ),
              children: renderSecuritySettings(),
            },
            {
              key: 'storage',
              label: (
                <Space>
                  <CloudOutlined />
                  存储设置
                </Space>
              ),
              children: renderStorageSettings(),
            },
          ]}
          tabBarExtraContent={
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
            >
              保存配置
            </Button>
          }
        />
      </Form>
    </div>
  );
};

export default SystemSettings;
