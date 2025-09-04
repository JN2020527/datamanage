import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tree,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Switch,
  Divider,
  Alert,
  Badge,
  List,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SafetyOutlined,
  CrownOutlined,
  KeyOutlined,
  UserOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
  path?: string;
  children?: Permission[];
}

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟权限数据
  const mockPermissions: Permission[] = [
    {
      id: 'dashboard',
      name: '仪表板',
      code: 'dashboard',
      type: 'menu',
      path: '/',
      children: [
        {
          id: 'dashboard:view',
          name: '查看仪表板',
          code: 'dashboard:view',
          type: 'button',
          parentId: 'dashboard',
        },
      ],
    },
    {
      id: 'asset',
      name: '资产管理',
      code: 'asset',
      type: 'menu',
      path: '/discovery',
      children: [
        {
          id: 'asset:discovery',
          name: '资产发现',
          code: 'asset:discovery',
          type: 'menu',
          parentId: 'asset',
          children: [
            {
              id: 'asset:discovery:view',
              name: '查看资产',
              code: 'asset:discovery:view',
              type: 'button',
              parentId: 'asset:discovery',
            },
            {
              id: 'asset:discovery:search',
              name: '搜索资产',
              code: 'asset:discovery:search',
              type: 'button',
              parentId: 'asset:discovery',
            },
          ],
        },
        {
          id: 'asset:development',
          name: '资产开发',
          code: 'asset:development',
          type: 'menu',
          parentId: 'asset',
          children: [
            {
              id: 'asset:development:create',
              name: '创建资产',
              code: 'asset:development:create',
              type: 'button',
              parentId: 'asset:development',
            },
            {
              id: 'asset:development:edit',
              name: '编辑资产',
              code: 'asset:development:edit',
              type: 'button',
              parentId: 'asset:development',
            },
            {
              id: 'asset:development:delete',
              name: '删除资产',
              code: 'asset:development:delete',
              type: 'button',
              parentId: 'asset:development',
            },
          ],
        },
      ],
    },
    {
      id: 'analysis',
      name: '敏捷分析',
      code: 'analysis',
      type: 'menu',
      path: '/analysis',
      children: [
        {
          id: 'analysis:view',
          name: '查看分析',
          code: 'analysis:view',
          type: 'button',
          parentId: 'analysis',
        },
        {
          id: 'analysis:create',
          name: '创建分析',
          code: 'analysis:create',
          type: 'button',
          parentId: 'analysis',
        },
        {
          id: 'analysis:export',
          name: '导出数据',
          code: 'analysis:export',
          type: 'button',
          parentId: 'analysis',
        },
      ],
    },
    {
      id: 'governance',
      name: '数据治理',
      code: 'governance',
      type: 'menu',
      path: '/governance',
      children: [
        {
          id: 'governance:standards',
          name: '数据标准',
          code: 'governance:standards',
          type: 'menu',
          parentId: 'governance',
          children: [
            {
              id: 'governance:standards:view',
              name: '查看标准',
              code: 'governance:standards:view',
              type: 'button',
              parentId: 'governance:standards',
            },
            {
              id: 'governance:standards:manage',
              name: '管理标准',
              code: 'governance:standards:manage',
              type: 'button',
              parentId: 'governance:standards',
            },
          ],
        },
        {
          id: 'governance:quality',
          name: '质量管理',
          code: 'governance:quality',
          type: 'menu',
          parentId: 'governance',
          children: [
            {
              id: 'governance:quality:view',
              name: '查看质量',
              code: 'governance:quality:view',
              type: 'button',
              parentId: 'governance:quality',
            },
            {
              id: 'governance:quality:manage',
              name: '管理质量',
              code: 'governance:quality:manage',
              type: 'button',
              parentId: 'governance:quality',
            },
          ],
        },
      ],
    },
    {
      id: 'system',
      name: '系统管理',
      code: 'system',
      type: 'menu',
      path: '/system',
      children: [
        {
          id: 'system:user',
          name: '用户管理',
          code: 'system:user',
          type: 'menu',
          parentId: 'system',
          children: [
            {
              id: 'system:user:view',
              name: '查看用户',
              code: 'system:user:view',
              type: 'button',
              parentId: 'system:user',
            },
            {
              id: 'system:user:create',
              name: '创建用户',
              code: 'system:user:create',
              type: 'button',
              parentId: 'system:user',
            },
            {
              id: 'system:user:edit',
              name: '编辑用户',
              code: 'system:user:edit',
              type: 'button',
              parentId: 'system:user',
            },
            {
              id: 'system:user:delete',
              name: '删除用户',
              code: 'system:user:delete',
              type: 'button',
              parentId: 'system:user',
            },
          ],
        },
        {
          id: 'system:role',
          name: '角色管理',
          code: 'system:role',
          type: 'menu',
          parentId: 'system',
          children: [
            {
              id: 'system:role:view',
              name: '查看角色',
              code: 'system:role:view',
              type: 'button',
              parentId: 'system:role',
            },
            {
              id: 'system:role:manage',
              name: '管理角色',
              code: 'system:role:manage',
              type: 'button',
              parentId: 'system:role',
            },
          ],
        },
      ],
    },
  ];

  // 模拟角色数据
  const mockRoles: Role[] = [
    {
      id: '1',
      name: '超级管理员',
      code: 'SuperAdmin',
      description: '系统最高权限管理员，拥有所有功能权限',
      permissions: ['*'], // 所有权限
      status: 'active',
      userCount: 1,
      isSystem: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-09-04',
    },
    {
      id: '2',
      name: '系统管理员',
      code: 'Admin',
      description: '系统管理员，拥有用户管理和系统配置权限',
      permissions: [
        'dashboard:view',
        'asset:discovery:view',
        'asset:discovery:search',
        'system:user:view',
        'system:user:create',
        'system:user:edit',
        'system:user:delete',
        'system:role:view',
        'system:role:manage',
      ],
      status: 'active',
      userCount: 2,
      isSystem: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-09-03',
    },
    {
      id: '3',
      name: '产品经理',
      code: 'ProductManager',
      description: '产品管理和规划人员',
      permissions: [
        'dashboard:view',
        'asset:discovery:view',
        'asset:discovery:search',
        'analysis:view',
        'analysis:create',
        'governance:standards:view',
        'governance:quality:view',
      ],
      status: 'active',
      userCount: 3,
      isSystem: false,
      createdAt: '2023-02-15',
      updatedAt: '2024-08-20',
    },
    {
      id: '4',
      name: '开发工程师',
      code: 'Developer',
      description: '系统开发和维护人员',
      permissions: [
        'dashboard:view',
        'asset:discovery:view',
        'asset:discovery:search',
        'asset:development:create',
        'asset:development:edit',
        'asset:development:delete',
        'analysis:view',
      ],
      status: 'active',
      userCount: 5,
      isSystem: false,
      createdAt: '2023-03-10',
      updatedAt: '2024-08-15',
    },
    {
      id: '5',
      name: '数据分析师',
      code: 'Analyst',
      description: '数据分析和报表人员',
      permissions: [
        'dashboard:view',
        'asset:discovery:view',
        'asset:discovery:search',
        'analysis:view',
        'analysis:create',
        'analysis:export',
        'governance:quality:view',
      ],
      status: 'active',
      userCount: 4,
      isSystem: false,
      createdAt: '2023-04-20',
      updatedAt: '2024-08-10',
    },
    {
      id: '6',
      name: '财务人员',
      code: 'Finance',
      description: '财务相关功能权限',
      permissions: [
        'dashboard:view',
        'asset:discovery:view',
        'analysis:view',
      ],
      status: 'active',
      userCount: 2,
      isSystem: false,
      createdAt: '2023-05-05',
      updatedAt: '2024-07-25',
    },
  ];

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(mockRoles);
    } catch (error) {
      showError('加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPermissions(mockPermissions);
      setExpandedKeys(mockPermissions.map(p => p.id));
    } catch (error) {
      showError('加载权限列表失败');
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const roleData = {
        ...values,
        id: editingRole?.id || Date.now().toString(),
        permissions: editingRole?.permissions || [],
        userCount: editingRole?.userCount || 0,
        isSystem: editingRole?.isSystem || false,
        createdAt: editingRole?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (editingRole) {
        setRoles(prev =>
          prev.map(item => (item.id === editingRole.id ? roleData : item))
        );
        showSuccess('角色更新成功');
      } else {
        setRoles(prev => [...prev, roleData]);
        showSuccess('角色创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      showError('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setRoles(prev => prev.filter(item => item.id !== id));
      showSuccess('角色删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const handlePermissionAssign = (role: Role) => {
    setSelectedRole(role);
    if (role.permissions.includes('*')) {
      // 超级管理员拥有所有权限
      const allPermissionIds = getAllPermissionIds(permissions);
      setCheckedPermissions(allPermissionIds);
    } else {
      setCheckedPermissions(role.permissions);
    }
    setPermissionModalVisible(true);
  };

  const getAllPermissionIds = (permissions: Permission[]): string[] => {
    const ids: string[] = [];
    const traverse = (perms: Permission[]) => {
      perms.forEach(perm => {
        ids.push(perm.id);
        if (perm.children) {
          traverse(perm.children);
        }
      });
    };
    traverse(permissions);
    return ids;
  };

  const handlePermissionSubmit = async () => {
    try {
      if (selectedRole) {
        const updatedPermissions = checkedPermissions.length === getAllPermissionIds(permissions).length 
          ? ['*'] // 如果选择了所有权限，则设置为 *
          : checkedPermissions;

        setRoles(prev =>
          prev.map(role =>
            role.id === selectedRole.id
              ? { ...role, permissions: updatedPermissions }
              : role
          )
        );
        showSuccess('权限分配成功');
      }
      setPermissionModalVisible(false);
      setCheckedPermissions([]);
    } catch (error) {
      showError('权限分配失败');
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      setRoles(prev =>
        prev.map(role =>
          role.id === id ? { ...role, status } : role
        )
      );
      showSuccess(`角色${status === 'active' ? '启用' : '禁用'}成功`);
    } catch (error) {
      showError('状态更新失败');
    }
  };

  const getPermissionTreeData = (permissions: Permission[]): any[] => {
    return permissions.map(perm => ({
      title: (
        <Space>
          <Text>{perm.name}</Text>
          <Tag size="small" color={perm.type === 'menu' ? 'blue' : perm.type === 'button' ? 'green' : 'orange'}>
            {perm.type === 'menu' ? '菜单' : perm.type === 'button' ? '按钮' : 'API'}
          </Tag>
        </Space>
      ),
      key: perm.id,
      children: perm.children ? getPermissionTreeData(perm.children) : undefined,
    }));
  };

  const getRoleTypeIcon = (role: Role) => {
    if (role.isSystem) {
      return role.code === 'SuperAdmin' ? <CrownOutlined style={{ color: '#f5222d' }} /> : <SafetyOutlined style={{ color: '#faad14' }} />;
    }
    return <TeamOutlined style={{ color: '#1890ff' }} />;
  };

  const getRoleStatusColor = (status: string) => {
    return status === 'active' ? 'green' : 'red';
  };

  const getPermissionCount = (role: Role) => {
    if (role.permissions.includes('*')) {
      return getAllPermissionIds(permissions).length;
    }
    return role.permissions.length;
  };

  const columns = [
    {
      title: '角色信息',
      key: 'roleInfo',
      width: 300,
      render: (_: any, record: Role) => (
        <Space>
          <Avatar
            size={40}
            icon={getRoleTypeIcon(record)}
            style={{ 
              backgroundColor: record.isSystem ? '#f0f2f5' : '#e6f7ff',
              color: '#1890ff'
            }}
          />
          <div>
            <div>
              <Text strong>{record.name}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                @{record.code}
              </Text>
              {record.isSystem && (
                <Tag size="small" color="orange" style={{ marginLeft: '8px' }}>
                  系统角色
                </Tag>
              )}
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      width: 120,
      render: (_: any, record: Role) => (
        <Space>
          <KeyOutlined />
          <Text>{getPermissionCount(record)}</Text>
          {record.permissions.includes('*') && (
            <Tag color="red" size="small">全部</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count: number) => (
        <Space>
          <UserOutlined />
          <Text>{count}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Role) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.id, checked ? 'active' : 'inactive')}
          disabled={record.isSystem}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_: any, record: Role) => (
        <Space>
          <Tooltip title="查看权限">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePermissionAssign(record)}
            />
          </Tooltip>
          <Tooltip title="分配权限">
            <Button
              type="text"
              icon={<KeyOutlined />}
              size="small"
              onClick={() => handlePermissionAssign(record)}
              disabled={record.code === 'SuperAdmin'}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={record.isSystem}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个角色吗？"
            description="删除后相关用户将失去该角色权限"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.isSystem || record.userCount > 0}
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title={record.isSystem ? '系统角色不能删除' : record.userCount > 0 ? '该角色下还有用户，不能删除' : '删除'}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                disabled={record.isSystem || record.userCount > 0}
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
            <TeamOutlined /> 角色管理
          </Title>
          <Text type="secondary">
            管理系统角色和权限，控制用户访问范围和功能权限
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建角色
          </Button>
        </Col>
      </Row>

      <Card>
        <Alert
          message="权限说明"
          description="超级管理员拥有所有权限且不可修改；系统角色不可删除；有用户关联的角色不可删除。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            total: roles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 角色编辑模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
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
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色代码"
            name="code"
            rules={[
              { required: true, message: '请输入角色代码' },
              { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母开头' },
            ]}
          >
            <Input placeholder="输入角色代码" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="description"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea rows={3} placeholder="输入角色描述..." />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRole ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 权限分配模态框 */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            权限配置 - {selectedRole?.name}
          </Space>
        }
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={
          selectedRole?.code !== 'SuperAdmin' ? (
            <Space>
              <Button onClick={() => setPermissionModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handlePermissionSubmit}>
                确定
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setPermissionModalVisible(false)}>关闭</Button>
          )
        }
        width={800}
        destroyOnClose
      >
        {selectedRole?.code === 'SuperAdmin' ? (
          <Alert
            message="超级管理员拥有所有权限"
            description="超级管理员角色默认拥有系统所有功能权限，无需单独配置。"
            type="success"
            showIcon
          />
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">
                已选择 {checkedPermissions.length} 个权限
              </Text>
            </div>
            <Tree
              checkable
              checkedKeys={checkedPermissions}
              onCheck={(checkedKeysValue) => {
                setCheckedPermissions(checkedKeysValue as string[]);
              }}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              treeData={getPermissionTreeData(permissions)}
              style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #f0f0f0', padding: '16px' }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;
