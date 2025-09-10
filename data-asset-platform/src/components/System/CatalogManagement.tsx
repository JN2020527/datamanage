import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Tree,
  Typography,
  Space,
  Button,
  Input,
  Form,
  Select,
  Switch,
  Modal,
  Tag,
  Table,
  message,
  Tooltip,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExpandOutlined,
  CompressOutlined,
} from '@ant-design/icons';

import './CatalogManagement.css';

const { Title, Text } = Typography;

interface CatalogNode {
  key: string;
  title: string;
  type: 'folder' | 'link' | 'rule';
  children?: CatalogNode[];
  visible?: boolean;
  order?: number;
  targetTypes?: string[]; // 适用资产类型
  keywordBoost?: number; // 关键词权重
  id?: string; // 目录ID
  description?: string; // 目录描述
  updater?: string; // 更新人
  updatedAt?: string; // 更新时间
  isNew?: boolean; // 是否新建未保存
}

const initialTree: CatalogNode[] = [
  {
    key: 'root-1',
    title: '按资产类型',
    type: 'folder',
    visible: true,
    order: 1,
    children: [
      { key: 't-table', title: '数据表', type: 'link', visible: true, order: 1, targetTypes: ['table'] },
      { key: 't-model', title: '数据模型', type: 'link', visible: true, order: 2, targetTypes: ['model'] },
      { key: 't-report', title: '报表', type: 'link', visible: true, order: 3, targetTypes: ['report'] },
    ],
  },
  {
    key: 'root-2',
    title: '按部门',
    type: 'folder',
    visible: true,
    order: 2,
    children: [
      { key: 'd-bi', title: '业务部门', type: 'link', visible: true, order: 1 },
      { key: 'd-it', title: '技术团队', type: 'link', visible: true, order: 2 },
    ],
  },
];

const columnsDef = [
  { title: '名称', dataIndex: 'title' },
  { title: '类型', dataIndex: 'type', render: (t: string) => (t === 'folder' ? '目录' : t === 'link' ? '链接' : '规则') },
  { title: '可见性', dataIndex: 'visible', render: (v: boolean) => (v ? <Tag color="green">可见</Tag> : <Tag>隐藏</Tag>) },
  { title: '排序', dataIndex: 'order' },
];

const CatalogManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<CatalogNode[]>(initialTree);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<string[]>(initialTree.map(n => n.key));
  const [searchValue, setSearchValue] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [editingValues, setEditingValues] = useState<{ title?: string; description?: string }>({});
  const [idSeq, setIdSeq] = useState<number>(1000);
  // 生成自增ID（字符串）
  const getNextId = (): string => {
    const next = idSeq + 1;
    setIdSeq(next);
    return String(next);
  };

  const currentUser = '张三'; // TODO: 接入登录用户

  const flatList = useMemo(() => {
    const list: CatalogNode[] = [];
    const dfs = (nodes: CatalogNode[]) => {
      nodes.forEach(n => {
        list.push(n);
        if (n.children?.length) dfs(n.children);
      });
    };
    dfs(treeData);
    return list;
  }, [treeData]);

  const selectedNode = useMemo(() => flatList.find(n => n.key === selectedKey), [flatList, selectedKey]);

  const toAntTree = (nodes: CatalogNode[]): any[] =>
    nodes
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(n => ({
        key: n.key,
        title: (
          <Space>
            {n.type === 'folder' ? <FolderOutlined /> : <DatabaseOutlined />}
            <span>{n.title}</span>
            {!n.visible && <Tag>隐藏</Tag>}
          </Space>
        ),
        children: n.children ? toAntTree(n.children) : undefined,
      }));

  const getAllKeys = (nodes: CatalogNode[]): string[] => {
    const keys: string[] = [];
    const dfs = (arr: CatalogNode[]) => arr.forEach(n => { keys.push(n.key); if (n.children) dfs(n.children); });
    dfs(nodes);
    return keys;
  };

  const getMatchedKeysWithAncestors = (keyword: string): string[] => {
    if (!keyword.trim()) return [];
    const lower = keyword.toLowerCase();
    const set = new Set<string>();
    const dfs = (arr: CatalogNode[], ancestors: string[]) => {
      arr.forEach(n => {
        const newAncestors = [...ancestors, n.key];
        if (n.title.toLowerCase().includes(lower)) {
          newAncestors.forEach(k => set.add(k));
        }
        if (n.children) dfs(n.children, newAncestors);
      });
    };
    dfs(treeData, []);
    return Array.from(set);
  };

  const handleExpandAll = () => setExpandedKeys(getAllKeys(treeData));
  const handleCollapseAll = () => setExpandedKeys([]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (!val) return;
    setExpandedKeys(getMatchedKeysWithAncestors(val));
  };
  const handleSearch = (val: string) => {
    setSearchValue(val);
    if (!val) { setExpandedKeys([]); return; }
    setExpandedKeys(getMatchedKeysWithAncestors(val));
  };

  const handleAdd = (type: CatalogNode['type']) => {
    if (!selectedNode && type !== 'folder') {
      message.warning('请先选择一个目录作为父节点');
      return;
    }
    const key = `${type}-${Date.now()}`;
    const node: CatalogNode = {
      key,
      title: type === 'folder' ? '新建目录' : type === 'link' ? '新建链接' : '新建规则',
      type,
      visible: true,
      order: 99,
      children: type === 'folder' ? [] : undefined,
    };

    const insert = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes.map(n => {
        if (n.key === selectedKey && n.type === 'folder') {
          return { ...n, children: [...(n.children || []), node] };
        }
        if (n.children?.length) return { ...n, children: insert(n.children) };
        return n;
      });

    if (!selectedKey || !selectedNode) {
      setTreeData(prev => [...prev, node]);
    } else {
      setTreeData(prev => insert(prev));
    }
    setSelectedKey(key);
    setEditing(true);
    setTimeout(() => form.setFieldsValue(node), 0);
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      onOk: () => {
        const remove = (nodes: CatalogNode[]): CatalogNode[] =>
          nodes
            .filter(n => n.key !== selectedKey)
            .map(n => (n.children ? { ...n, children: remove(n.children) } : n));
        setTreeData(prev => remove(prev));
        setSelectedKey('');
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const update = (nodes: CatalogNode[]): CatalogNode[] =>
        nodes.map(n => {
          if (n.key === selectedKey) return { ...n, ...values };
          if (n.children?.length) return { ...n, children: update(n.children) };
          return n;
        });
      setTreeData(prev => update(prev));
      message.success('已保存目录配置（模拟）');
      setEditing(false);
    } catch {}
  };

  // 根据key在树中更新节点
  const updateNode = (updaterFn: (n: CatalogNode) => CatalogNode) => {
    const loop = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes.map(n => {
        if (n.key === editingKey) return updaterFn(n);
        return n.children ? { ...n, children: loop(n.children) } : n;
      });
    setTreeData(prev => loop(prev));
  };

  const insertChild = (parentKey: string, child: CatalogNode) => {
    const loop = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes.map(n => {
        if (n.key === parentKey) {
          return { ...n, children: [...(n.children || []), child] };
        }
        return n.children ? { ...n, children: loop(n.children) } : n;
      });
    setTreeData(prev => loop(prev));
  };

  const handleStartEdit = (record: CatalogNode) => {
    setEditingKey(record.key);
    setEditingValues({ title: record.title, description: record.description });
  };

  const handleSaveInline = () => {
    if (!editingKey) return;
    const now = new Date().toLocaleString();
    updateNode(n => ({
      ...n,
      title: editingValues.title || n.title,
      description: editingValues.description || n.description,
      updater: currentUser,
      updatedAt: now,
      id: n.id || getNextId(),
      isNew: false,
    }));
    setEditingKey('');
    setEditingValues({});
  };

  const handleCancelInline = () => {
    if (!editingKey) return;
    // 如果是新建且未填写名称，则移除
    const removeIfNewAndEmpty = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes
        .filter(n => !(n.key === editingKey && n.isNew && !n.title))
        .map(n => (n.children ? { ...n, children: removeIfNewAndEmpty(n.children) } : n));
    setTreeData(prev => removeIfNewAndEmpty(prev));
    setEditingKey('');
    setEditingValues({});
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 600 }}>目录管理</Title>
      </div>
      <Divider style={{ margin: '8px 0 20px' }} />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <>目录结构</>
            }
            extra={
              <Space wrap>
                <Input
                  placeholder="搜索目录..."
                  allowClear
                  value={searchValue}
                  onChange={handleSearchChange}
                  onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                  prefix={<SearchOutlined />}
                  style={{ width: 220 }}
                />
                {editMode ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    const key = `folder-${Date.now()}`;
                    const node: CatalogNode = { key, title: '', description: '', type: 'folder', visible: true, order: 99, children: [], id: getNextId(), isNew: true };
                    setTreeData(prev => [...prev, node]);
                    setSelectedKey(key);
                    setEditingKey(key);
                    setEditingValues({ title: '', description: '' });
                    message.info('已新增一级目录，请填写名称与描述');
                    setTimeout(() => {
                      const rowEl = document.querySelector(`tr[data-row-key="${key}"]`) as HTMLElement | null;
                      rowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 0);
                  }}>
                    新建一级目录
                  </Button>
                ) : (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                    编辑目录
                  </Button>
                )}
                <Tooltip title="全部展开">
                  <Button icon={<ExpandOutlined />} onClick={handleExpandAll} />
                </Tooltip>
                <Tooltip title="全部合上">
                  <Button icon={<CompressOutlined />} onClick={handleCollapseAll} />
                </Tooltip>
                <Tooltip title="刷新">
                  <Button icon={<ReloadOutlined />} onClick={() => message.info('已刷新（模拟）')} />
                </Tooltip>
              </Space>
            }
          >
            <Table
              rowKey="key"
              size="small"
              pagination={false}
              expandable={{ expandedRowKeys: expandedKeys, onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]) }}
              onRow={(record: any) => ({
                onClick: () => setSelectedKey(record.key),
                onDoubleClick: (e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('.row-action-cell')) return;
                  setSelectedKey(record.key);
                  setEditingKey(record.key);
                  setEditingValues({ title: record.title, description: record.description || '' });
                },
              })}
              columns={[
                { title: '目录名称', dataIndex: 'title', key: 'title',
                  render: (_: any, record: CatalogNode) => (editMode && editingKey === record.key ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        size="small"
                        value={editingValues.title}
                        placeholder="请输入目录名称"
                        onChange={(e) => setEditingValues(v => ({ ...v, title: e.target.value }))}
                        onPressEnter={handleSaveInline}
                        style={{ width: '100%' }}
                      />
                    </div>
                  ) : (
                    record.title
                  ))
                },
                { title: '目录ID', dataIndex: 'id', key: 'id', render: (_: any, r: CatalogNode) => r.id || r.key },
                { title: '目录描述', dataIndex: 'description', key: 'description',
                  render: (_: any, record: CatalogNode) => (editMode && editingKey === record.key ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        size="small"
                        value={editingValues.description}
                        placeholder="请输入目录描述"
                        onChange={(e) => setEditingValues(v => ({ ...v, description: e.target.value }))}
                        onPressEnter={handleSaveInline}
                        style={{ width: '100%' }}
                      />
                    </div>
                  ) : (
                    record.description
                  ))
                },
                { title: '更新人', dataIndex: 'updater', key: 'updater' },
                { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
                ...(editMode ? [{
                  title: '操作',
                  key: 'actions',
                  width: 140,
                  render: (_: any, record: CatalogNode) => (
                    <Space className="row-action-cell">
                      {editingKey === record.key ? (
                        <>
                          <Tooltip title="保存">
                            <Button
                              size="small"
                              icon={<CheckOutlined style={{ fontSize: 16 }} />}
                              onClick={(e) => { e.stopPropagation(); handleSaveInline(); }}
                              onDoubleClick={(e) => { e.stopPropagation(); }}
                              className="catalog-action-btn"
                              style={{ borderRadius: 6, width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                          </Tooltip>
                          <Tooltip title="取消">
                            <Button
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleCancelInline(); }}
                              onDoubleClick={(e) => { e.stopPropagation(); }}
                              icon={<CloseOutlined style={{ fontSize: 16 }} />}
                              className="catalog-action-btn"
                              style={{ borderRadius: 6, width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="新建子目录">
                            <Button
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const childKey = `folder-${Date.now()}`;
                                const child: CatalogNode = { key: childKey, title: '', description: '', type: 'folder', visible: true, order: 99, children: [], id: getNextId(), isNew: true };
                                insertChild(record.key, child);
                                setSelectedKey(childKey);
                                setExpandedKeys(keys => Array.from(new Set([...keys, record.key])));
                                setEditingKey(childKey);
                                setEditingValues({ title: '', description: '' });
                              }}
                              onDoubleClick={(e) => { e.stopPropagation(); }}
                              className="catalog-action-btn"
                              style={{ borderRadius: 6, width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                          </Tooltip>
                          <Tooltip title="编辑">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => { e.stopPropagation(); setSelectedKey(record.key); handleStartEdit(record); }}
                              onDoubleClick={(e) => { e.stopPropagation(); }}
                              className="catalog-action-btn"
                              style={{ borderRadius: 6, width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                          </Tooltip>
                          <Tooltip title="删除">
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                Modal.confirm({
                                  title: '确认删除',
                                  onOk: () => {
                                    const remove = (nodes: CatalogNode[]): CatalogNode[] => nodes
                                      .filter(n => n.key !== record.key)
                                      .map(n => n.children ? { ...n, children: remove(n.children) } : n);
                                    setTreeData(prev => remove(prev));
                                    if (selectedKey === record.key) setSelectedKey('');
                                    if (editingKey === record.key) setEditingKey('');
                                  },
                                });
                              }}
                              onDoubleClick={(e) => { e.stopPropagation(); }}
                              className="catalog-action-btn"
                              style={{ borderRadius: 6, width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Space>
                  )
                }] : [])
              ]}
              dataSource={(function map(nodes: CatalogNode[]): any[] {
                return nodes.map(n => ({
                  ...n,
                  id: n.id || n.key,
                  description: n.description || '',
                  updater: n.updater || '',
                  updatedAt: n.updatedAt || '',
                  children: n.children ? map(n.children) : undefined,
                }));
              })(treeData)}
            />
          </Card>
        </Col>
      </Row>

      {/* 编辑弹窗：在目录结构上进行增删改查 */}
      <Modal
        title={<Space><EditOutlined /> 编辑目录节点</Space>}
        open={editing}
        onOk={handleSave}
        onCancel={() => setEditing(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        {selectedNode ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={selectedNode}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
                  <Input placeholder="目录/链接的显示名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="type" label="类型">
                  <Select options={[{ value: 'folder', label: '目录' }, { value: 'link', label: '链接' }, { value: 'rule', label: '规则' }]} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="visible" valuePropName="checked" label="是否可见">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="order" label="排序（数字越小越靠前）">
                  <Input type="number" placeholder="例如 1" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="targetTypes" label="适用资产类型">
                  <Select mode="multiple" placeholder="选择适用对象" options={[
                    { value: 'table', label: '数据表' },
                    { value: 'model', label: '数据模型' },
                    { value: 'report', label: '报表' },
                    { value: 'dataset', label: '数据集' },
                    { value: 'api', label: 'API' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : (
          <Text type="secondary">请选择一个节点后进行编辑</Text>
        )}
      </Modal>
    </div>
  );
};

export default CatalogManagement;


