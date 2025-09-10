import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Avatar,
  Switch,
  DatePicker,
  Divider,
  Transfer,
  TreeSelect,
  Upload,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  UploadOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  position: string;
  roles: string[];
  status: 'active' | 'inactive' | 'locked';
  lastLoginTime: string;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
}

interface Department {
  id: string;
  name: string;
  parentId?: string;
  children?: Department[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      nickname: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      avatar: '',
      department: '技术部',
      position: '系统架构师',
      roles: ['SuperAdmin', 'Admin'],
      status: 'active',
      lastLoginTime: '2024-09-04 10:30:00',
      createdAt: '2023-01-01',
      updatedAt: '2024-09-04',
      remark: '系统超级管理员',
    },
    {
      id: '2',
      username: 'zhang.san',
      nickname: '张三',
      email: 'zhang.san@example.com',
      phone: '13800138001',
      avatar: '',
      department: '产品部',
      position: '产品经理',
      roles: ['ProductManager'],
      status: 'active',
      lastLoginTime: '2024-09-04 09:15:00',
      createdAt: '2023-02-15',
      updatedAt: '2024-09-03',
      remark: '负责数据平台产品规划',
    },
    {
      id: '3',
      username: 'li.si',
      nickname: '李四',
      email: 'li.si@example.com',
      phone: '13800138002',
      avatar: '',
      department: '技术部',
      position: '前端工程师',
      roles: ['Developer'],
      status: 'active',
      lastLoginTime: '2024-09-04 08:45:00',
      createdAt: '2023-03-10',
      updatedAt: '2024-09-02',
      remark: '前端开发专家',
    },
    {
      id: '4',
      username: 'wang.wu',
      nickname: '王五',
      email: 'wang.wu@example.com',
      phone: '13800138003',
      avatar: '',
      department: '运营部',
      position: '数据分析师',
      roles: ['Analyst'],
      status: 'inactive',
      lastLoginTime: '2024-08-28 16:20:00',
      createdAt: '2023-04-20',
      updatedAt: '2024-08-28',
      remark: '数据分析和运营支持',
    },
    {
      id: '5',
      username: 'zhao.liu',
      nickname: '赵六',
      email: 'zhao.liu@example.com',
      phone: '13800138004',
      avatar: '',
      department: '财务部',
      position: '财务专员',
      roles: ['Finance'],
      status: 'locked',
      lastLoginTime: '2024-08-15 14:30:00',
      createdAt: '2023-05-05',
      updatedAt: '2024-08-15',
      remark: '财务数据管理',
    },
  ];

  const mockRoles: Role[] = [
    {
      id: '1',
      name: '超级管理员',
      code: 'SuperAdmin',
      description: '系统最高权限管理员',
      permissions: ['*'],
    },
    {
      id: '2',
      name: '管理员',
      code: 'Admin',
      description: '系统管理员',
      permissions: ['user:*', 'system:*', 'governance:*'],
    },
    {
      id: '3',
      name: '产品经理',
      code: 'ProductManager',
      description: '产品管理和规划',
      permissions: ['asset:read', 'analysis:*', 'governance:read'],
    },
    {
      id: '4',
      name: '开发工程师',
      code: 'Developer',
      description: '系统开发和维护',
      permissions: ['asset:*', 'development:*', 'analysis:read'],
    },
    {
      id: '5',
      name: '数据分析师',
      code: 'Analyst',
      description: '数据分析和报表',
      permissions: ['asset:read', 'analysis:*', 'governance:read'],
    },
    {
      id: '6',
      name: '财务人员',
      code: 'Finance',
      description: '财务相关功能',
      permissions: ['asset:read', 'analysis:read'],
    },
  ];

  const mockDepartments: Department[] = [
    {
      id: '1',
      name: '技术部',
      children: [
        { id: '11', name: '前端组', parentId: '1' },
        { id: '12', name: '后端组', parentId: '1' },
        { id: '13', name: '运维组', parentId: '1' },
      ],
    },
    {
      id: '2',
      name: '产品部',
      children: [
        { id: '21', name: '产品设计', parentId: '2' },
        { id: '22', name: '用户体验', parentId: '2' },
      ],
    },
    {
      id: '3',
      name: '运营部',
      children: [
        { id: '31', name: '市场推广', parentId: '3' },
        { id: '32', name: '数据运营', parentId: '3' },
      ],
    },
    {
      id: '4',
      name: '财务部',
    },
    {
      id: '5',
      name: '人事部',
    },
  ];

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUsers);
    } catch (error) {
      showError('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setRoles(mockRoles);
    } catch (error) {
      showError('加载角色列表失败');
    }
  };

  const loadDepartments = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDepartments(mockDepartments);
    } catch (error) {
      showError('加载部门列表失败');
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      password: undefined, // 编辑时不显示密码
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const userData = {
        ...values,
        id: editingUser?.id || Date.now().toString(),
        avatar: editingUser?.avatar || '',
        lastLoginTime: editingUser?.lastLoginTime || '',
        createdAt: editingUser?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (editingUser) {
        setUsers(prev =>
          prev.map(item => (item.id === editingUser.id ? userData : item))
        );
        showSuccess('用户更新成功');
      } else {
        setUsers(prev => [...prev, userData]);
        showSuccess('用户创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      showError('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setUsers(prev => prev.filter(item => item.id !== id));
      showSuccess('用户删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, status: status as any } : user
        )
      );
      const statusText = status === 'active' ? '启用' : status === 'inactive' ? '禁用' : '锁定';
      showSuccess(`用户${statusText}成功`);
    } catch (error) {
      showError('状态更新失败');
    }
  };

  const handleRoleAssign = (user: User) => {
    setSelectedUser(user);
    roleForm.setFieldsValue({
      roles: user.roles,
    });
    setRoleModalVisible(true);
  };

  const handleRoleSubmit = async (values: any) => {
    try {
      if (selectedUser) {
        setUsers(prev =>
          prev.map(user =>
            user.id === selectedUser.id
              ? { ...user, roles: values.roles }
              : user
          )
        );
        showSuccess('角色分配成功');
      }
      setRoleModalVisible(false);
      roleForm.resetFields();
    } catch (error) {
      showError('角色分配失败');
    }
  };

  const handleExport = () => {
    const csvContent = generateCSV(filteredUsers);
    downloadCSV(csvContent, `users_export_${Date.now()}.csv`);
    showSuccess('用户数据导出成功');
  };

  const generateCSV = (data: User[]) => {
    const headers = ['用户名', '昵称', '邮箱', '电话', '部门', '职位', '角色', '状态', '最后登录', '创建时间'];
    const rows = data.map(user =>
      [
        user.username,
        user.nickname,
        user.email,
        user.phone,
        user.department,
        user.position,
        user.roles.join(';'),
        user.status,
        user.lastLoginTime,
        user.createdAt,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'locked': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'inactive': return '禁用';
      case 'locked': return '锁定';
      default: return status;
    }
  };

  const getRoleColor = (roleCode: string) => {
    switch (roleCode) {
      case 'SuperAdmin': return 'red';
      case 'Admin': return 'orange';
      case 'ProductManager': return 'blue';
      case 'Developer': return 'green';
      case 'Analyst': return 'purple';
      case 'Finance': return 'gold';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = !searchText || 
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 250,
      render: (_: any, record: User) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.nickname?.charAt(0)}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.nickname}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                @{record.username}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.department} - {record.position}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_: any, record: User) => (
        <Space direction="vertical" size="small">
          <Space>
            <MailOutlined />
            <Text>{record.email}</Text>
          </Space>
          <Space>
            <PhoneOutlined />
            <Text>{record.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(role => {
            const roleInfo = mockRoles.find(r => r.code === role);
            return (
              <Tag key={role} color={getRoleColor(role)}>
                {roleInfo?.name || role}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 150,
      render: (time: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '从未登录'}</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="分配角色">
            <Button
              type="text"
              icon={<TeamOutlined />}
              size="small"
              onClick={() => handleRoleAssign(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              size="small"
              onClick={() => 
                handleStatusChange(
                  record.id, 
                  record.status === 'active' ? 'inactive' : 'active'
                )
              }
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <UserOutlined /> 用户管理
          </Title>
          <Text type="secondary">
            管理系统用户，包括创建、编辑、角色分配和权限控制
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出数据
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadUsers}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建用户
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索用户名、昵称或邮箱..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              enterButton
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
              <Select.Option value="locked">锁定</Select.Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_.]+$/, message: '用户名只能包含字母、数字、下划线和点' },
                ]}
              >
                <Input placeholder="输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="昵称"
                name="nickname"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="输入昵称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="输入邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input placeholder="输入手机号" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度至少6位' },
                  ]}
                >
                  <Input.Password placeholder="输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="确认密码"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <TreeSelect
                  treeData={departments}
                  placeholder="选择部门"
                  treeDefaultExpandAll
                  fieldNames={{
                    label: 'name',
                    value: 'name',
                    children: 'children',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="职位"
                name="position"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="roles"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="选择角色"
                  style={{ width: '100%' }}
                >
                  {roles.map(role => (
                    <Select.Option key={role.code} value={role.code}>
                      <Tag color={getRoleColor(role.code)}>{role.name}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Select.Option value="active">正常</Select.Option>
                  <Select.Option value="inactive">禁用</Select.Option>
                  <Select.Option value="locked">锁定</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="输入备注信息..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 角色分配模态框 */}
      <Modal
        title="分配角色"
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSubmit}
        >
          <Form.Item
            label={`为用户 "${selectedUser?.nickname}" 分配角色`}
            name="roles"
          >
            <Select
              mode="multiple"
              placeholder="选择角色"
              style={{ width: '100%' }}
            >
              {roles.map(role => (
                <Select.Option key={role.code} value={role.code}>
                  <Space>
                    <Tag color={getRoleColor(role.code)}>{role.name}</Tag>
                    <Text type="secondary">{role.description}</Text>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRoleModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
