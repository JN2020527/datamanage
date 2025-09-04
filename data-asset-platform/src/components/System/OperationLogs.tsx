import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  DatePicker,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Tooltip,
  Modal,
  Descriptions,
  Alert,
  Statistic,
  Progress,
  Timeline,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface OperationLog {
  id: string;
  userId: string;
  username: string;
  userNickname: string;
  userAvatar: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
  module: string;
  resourceId?: string;
  resourceName?: string;
  ip: string;
  userAgent: string;
  location: string;
  status: 'success' | 'failed' | 'warning';
  duration: number;
  details: string;
  timestamp: string;
  risk: 'low' | 'medium' | 'high';
}

interface LogStatistics {
  total: number;
  todayCount: number;
  successRate: number;
  failedCount: number;
  topUsers: Array<{
    username: string;
    nickname: string;
    count: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

const OperationLogs: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics>({
    total: 0,
    todayCount: 0,
    successRate: 0,
    failedCount: 0,
    topUsers: [],
    topActions: [],
    riskDistribution: { low: 0, medium: 0, high: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [searchText, setSearchText] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { showSuccess, showError } = useNotification();

  // 模拟日志数据
  const mockLogs: OperationLog[] = [
    {
      id: '1',
      userId: '1',
      username: 'admin',
      userNickname: '系统管理员',
      userAvatar: '',
      action: '登录系统',
      actionType: 'login',
      module: '用户认证',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '北京市',
      status: 'success',
      duration: 1200,
      details: '用户成功登录系统',
      timestamp: '2024-09-04 10:30:15',
      risk: 'low',
    },
    {
      id: '2',
      userId: '2',
      username: 'zhang.san',
      userNickname: '张三',
      userAvatar: '',
      action: '创建数据资产',
      actionType: 'create',
      module: '资产管理',
      resourceId: 'asset_001',
      resourceName: '用户行为数据表',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '上海市',
      status: 'success',
      duration: 2300,
      details: '成功创建新的数据资产：用户行为数据表',
      timestamp: '2024-09-04 09:45:20',
      risk: 'low',
    },
    {
      id: '3',
      userId: '3',
      username: 'li.si',
      userNickname: '李四',
      userAvatar: '',
      action: '修改系统配置',
      actionType: 'update',
      module: '系统管理',
      resourceId: 'config_security',
      resourceName: '安全配置',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: '广州市',
      status: 'success',
      duration: 1800,
      details: '修改了密码策略配置，要求密码最小长度为8位',
      timestamp: '2024-09-04 09:20:10',
      risk: 'medium',
    },
    {
      id: '4',
      userId: '4',
      username: 'wang.wu',
      userNickname: '王五',
      userAvatar: '',
      action: '删除数据标准',
      actionType: 'delete',
      module: '数据治理',
      resourceId: 'standard_001',
      resourceName: '旧版用户ID标准',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '深圳市',
      status: 'success',
      duration: 900,
      details: '删除了已废弃的数据标准',
      timestamp: '2024-09-04 08:55:30',
      risk: 'high',
    },
    {
      id: '5',
      userId: '5',
      username: 'zhao.liu',
      userNickname: '赵六',
      userAvatar: '',
      action: '尝试访问未授权页面',
      actionType: 'view',
      module: '权限管理',
      ip: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '杭州市',
      status: 'failed',
      duration: 500,
      details: '用户尝试访问系统管理页面，权限不足',
      timestamp: '2024-09-04 08:30:45',
      risk: 'medium',
    },
    {
      id: '6',
      userId: '2',
      username: 'zhang.san',
      userNickname: '张三',
      userAvatar: '',
      action: '导出分析报告',
      actionType: 'export',
      module: '敏捷分析',
      resourceId: 'report_001',
      resourceName: '月度数据质量报告',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '上海市',
      status: 'success',
      duration: 3200,
      details: '成功导出月度数据质量报告',
      timestamp: '2024-09-04 08:15:25',
      risk: 'low',
    },
    {
      id: '7',
      userId: '1',
      username: 'admin',
      userNickname: '系统管理员',
      userAvatar: '',
      action: '批量导入用户',
      actionType: 'import',
      module: '用户管理',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '北京市',
      status: 'warning',
      duration: 15000,
      details: '批量导入100个用户，其中5个用户因邮箱重复导入失败',
      timestamp: '2024-09-04 07:45:10',
      risk: 'medium',
    },
  ];

  const mockStatistics: LogStatistics = {
    total: 1234,
    todayCount: 56,
    successRate: 92.5,
    failedCount: 23,
    topUsers: [
      { username: 'admin', nickname: '系统管理员', count: 45 },
      { username: 'zhang.san', nickname: '张三', count: 32 },
      { username: 'li.si', nickname: '李四', count: 28 },
    ],
    topActions: [
      { action: '查看资产', count: 156 },
      { action: '登录系统', count: 89 },
      { action: '创建资产', count: 67 },
      { action: '导出数据', count: 45 },
    ],
    riskDistribution: {
      low: 856,
      medium: 267,
      high: 111,
    },
  };

  useEffect(() => {
    loadLogs();
    loadStatistics();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(mockLogs);
    } catch (error) {
      showError('加载操作日志失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setStatistics(mockStatistics);
    } catch (error) {
      showError('加载统计数据失败');
    }
  };

  const handleViewDetail = (log: OperationLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const handleExport = () => {
    const csvContent = generateCSV(filteredLogs);
    downloadCSV(csvContent, `operation_logs_${Date.now()}.csv`);
    showSuccess('操作日志导出成功');
  };

  const generateCSV = (data: OperationLog[]) => {
    const headers = ['时间', '用户', '操作', '模块', '状态', 'IP地址', '位置', '风险等级', '详情'];
    const rows = data.map(log =>
      [
        log.timestamp,
        `${log.userNickname}(${log.username})`,
        log.action,
        log.module,
        log.status,
        log.ip,
        log.location,
        log.risk,
        log.details,
      ].join(',')
    ).join('\n');
    return `${headers.join(',')}\n${rows}`;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'create': return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'update': return <EditOutlined style={{ color: '#1890ff' }} />;
      case 'delete': return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      case 'view': return <EyeOutlined style={{ color: '#722ed1' }} />;
      case 'login': return <LoginOutlined style={{ color: '#52c41a' }} />;
      case 'logout': return <LogoutOutlined style={{ color: '#faad14' }} />;
      case 'export': return <DownloadOutlined style={{ color: '#1890ff' }} />;
      case 'import': return <UploadOutlined style={{ color: '#1890ff' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'create': return 'green';
      case 'update': return 'blue';
      case 'delete': return 'red';
      case 'view': return 'purple';
      case 'login': return 'green';
      case 'logout': return 'orange';
      case 'export': return 'blue';
      case 'import': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'warning': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined />;
      case 'failed': return <ExclamationCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'default';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return risk;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case '用户认证': return <SecurityScanOutlined />;
      case '用户管理': return <UserOutlined />;
      case '资产管理': return <DatabaseOutlined />;
      case '数据治理': return <FileTextOutlined />;
      case '系统管理': return <SettingOutlined />;
      case '敏捷分析': return <BarChartOutlined />;
      case '权限管理': return <SecurityScanOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = !searchText || 
      log.username.toLowerCase().includes(searchText.toLowerCase()) ||
      log.userNickname.toLowerCase().includes(searchText.toLowerCase()) ||
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.details.toLowerCase().includes(searchText.toLowerCase());
    
    const matchActionType = actionTypeFilter === 'all' || log.actionType === actionTypeFilter;
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchRisk = riskFilter === 'all' || log.risk === riskFilter;
    
    const matchDate = !dateRange || (
      dayjs(log.timestamp).isAfter(dateRange[0]) && 
      dayjs(log.timestamp).isBefore(dateRange[1])
    );
    
    return matchSearch && matchActionType && matchModule && matchStatus && matchRisk && matchDate;
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <Space direction="vertical" size="small">
          <Text>{dayjs(timestamp).format('MM-DD HH:mm')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(timestamp).format('YYYY')}
          </Text>
        </Space>
      ),
    },
    {
      title: '用户',
      key: 'user',
      width: 180,
      render: (_: any, record: OperationLog) => (
        <Space>
          <Avatar
            size={32}
            src={record.userAvatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.userNickname?.charAt(0)}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.userNickname}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                @{record.username}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: OperationLog) => (
        <Space direction="vertical" size="small">
          <Space>
            {getActionTypeIcon(record.actionType)}
            <Text strong>{record.action}</Text>
          </Space>
          <Tag color={getActionTypeColor(record.actionType)} size="small">
            {record.actionType}
          </Tag>
        </Space>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module: string) => (
        <Space>
          {getModuleIcon(module)}
          <Text>{module}</Text>
        </Space>
      ),
    },
    {
      title: '资源',
      key: 'resource',
      width: 150,
      render: (_: any, record: OperationLog) => {
        if (!record.resourceName) return <Text type="secondary">-</Text>;
        return (
          <Space direction="vertical" size="small">
            <Text>{record.resourceName}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.resourceId}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={
            <Space>
              {getStatusIcon(status)}
              {status === 'success' ? '成功' : status === 'failed' ? '失败' : '警告'}
            </Space>
          }
        />
      ),
    },
    {
      title: '风险',
      dataIndex: 'risk',
      key: 'risk',
      width: 80,
      render: (risk: string) => (
        <Tag color={getRiskColor(risk)} size="small">
          {getRiskText(risk)}
        </Tag>
      ),
    },
    {
      title: 'IP地址',
      key: 'ipLocation',
      width: 150,
      render: (_: any, record: OperationLog) => (
        <Space direction="vertical" size="small">
          <Text>{record.ip}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.location}
          </Text>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: any, record: OperationLog) => (
        <Tooltip title="查看详情">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> 操作日志
          </Title>
          <Text type="secondary">
            记录和审计所有用户操作，保障系统安全
          </Text>
        </Col>
        <Col>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出日志
          </Button>
        </Col>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="今日操作"
              value={statistics.todayCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总操作数"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="成功率"
              value={statistics.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="失败次数"
              value={statistics.failedCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 筛选器 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Search
              placeholder="搜索用户、操作或详情..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton
            />
          </Col>
          <Col span={3}>
            <Select
              value={actionTypeFilter}
              onChange={setActionTypeFilter}
              style={{ width: '100%' }}
              placeholder="操作类型"
            >
              <Select.Option value="all">全部类型</Select.Option>
              <Select.Option value="create">创建</Select.Option>
              <Select.Option value="update">更新</Select.Option>
              <Select.Option value="delete">删除</Select.Option>
              <Select.Option value="view">查看</Select.Option>
              <Select.Option value="login">登录</Select.Option>
              <Select.Option value="logout">登出</Select.Option>
              <Select.Option value="export">导出</Select.Option>
              <Select.Option value="import">导入</Select.Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={moduleFilter}
              onChange={setModuleFilter}
              style={{ width: '100%' }}
              placeholder="模块"
            >
              <Select.Option value="all">全部模块</Select.Option>
              <Select.Option value="用户认证">用户认证</Select.Option>
              <Select.Option value="用户管理">用户管理</Select.Option>
              <Select.Option value="资产管理">资产管理</Select.Option>
              <Select.Option value="数据治理">数据治理</Select.Option>
              <Select.Option value="系统管理">系统管理</Select.Option>
              <Select.Option value="敏捷分析">敏捷分析</Select.Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="状态"
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
              <Select.Option value="warning">警告</Select.Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={riskFilter}
              onChange={setRiskFilter}
              style={{ width: '100%' }}
              placeholder="风险等级"
            >
              <Select.Option value="all">全部等级</Select.Option>
              <Select.Option value="low">低风险</Select.Option>
              <Select.Option value="medium">中风险</Select.Option>
              <Select.Option value="high">高风险</Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredLogs.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="操作详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: '16px' }}
            >
              <Descriptions.Item label="操作时间" span={2}>
                {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="用户">
                <Space>
                  <Avatar
                    size={24}
                    src={selectedLog.userAvatar}
                    icon={<UserOutlined />}
                  >
                    {selectedLog.userNickname?.charAt(0)}
                  </Avatar>
                  {selectedLog.userNickname} (@{selectedLog.username})
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Space>
                  {getActionTypeIcon(selectedLog.actionType)}
                  <Tag color={getActionTypeColor(selectedLog.actionType)}>
                    {selectedLog.actionType}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="操作">
                {selectedLog.action}
              </Descriptions.Item>
              <Descriptions.Item label="模块">
                <Space>
                  {getModuleIcon(selectedLog.module)}
                  {selectedLog.module}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="资源名称">
                {selectedLog.resourceName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="资源ID">
                {selectedLog.resourceId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">
                {selectedLog.ip}
              </Descriptions.Item>
              <Descriptions.Item label="位置">
                {selectedLog.location}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={getStatusColor(selectedLog.status) as any}
                  text={
                    <Space>
                      {getStatusIcon(selectedLog.status)}
                      {selectedLog.status === 'success' ? '成功' : selectedLog.status === 'failed' ? '失败' : '警告'}
                    </Space>
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={getRiskColor(selectedLog.risk)}>
                  {getRiskText(selectedLog.risk)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行时长">
                {selectedLog.duration}ms
              </Descriptions.Item>
              <Descriptions.Item label="详细信息" span={2}>
                {selectedLog.details}
              </Descriptions.Item>
              <Descriptions.Item label="用户代理" span={2}>
                <Text code style={{ fontSize: '12px' }}>
                  {selectedLog.userAgent}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogs;
