import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Tooltip,
  Pagination,
  Statistic,
  Row,
  Col,
  Typography,
  Drawer,
  Form,
  InputNumber,
  Switch,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  SettingOutlined,
  ReloadOutlined,
  EyeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Text, Title } = Typography;
const { Search } = Input;

interface DataPreviewProps {
  assetId: string;
  onCreateChart?: (data: any[], config: any) => void;
}

interface ColumnInfo {
  key: string;
  name: string;
  type: string;
  nullable: boolean;
  unique: number;
  min?: number;
  max?: number;
  avg?: number;
  nullCount: number;
  sampleValues: any[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ assetId, onCreateChart }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockData = Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    user_id: `user_${String(index + 1).padStart(6, '0')}`,
    name: ['张三', '李四', '王五', '赵六', '钱七'][index % 5],
    age: 18 + (index % 50),
    gender: index % 2 === 0 ? '男' : '女',
    city: ['北京', '上海', '广州', '深圳', '杭州'][index % 5],
    salary: 5000 + (index % 100) * 100,
    department: ['技术部', '产品部', '运营部', '财务部'][index % 4],
    join_date: new Date(2020 + (index % 4), (index % 12), (index % 28) + 1).toISOString().split('T')[0],
    status: ['active', 'inactive', 'pending'][index % 3],
    score: 60 + (index % 40),
  }));

  const mockColumns: ColumnInfo[] = [
    {
      key: 'id',
      name: 'ID',
      type: 'number',
      nullable: false,
      unique: 1000,
      min: 1,
      max: 1000,
      avg: 500.5,
      nullCount: 0,
      sampleValues: [1, 2, 3, 4, 5],
    },
    {
      key: 'user_id',
      name: '用户ID',
      type: 'string',
      nullable: false,
      unique: 1000,
      nullCount: 0,
      sampleValues: ['user_000001', 'user_000002', 'user_000003'],
    },
    {
      key: 'name',
      name: '姓名',
      type: 'string',
      nullable: false,
      unique: 5,
      nullCount: 0,
      sampleValues: ['张三', '李四', '王五', '赵六', '钱七'],
    },
    {
      key: 'age',
      name: '年龄',
      type: 'number',
      nullable: false,
      unique: 50,
      min: 18,
      max: 67,
      avg: 42.5,
      nullCount: 0,
      sampleValues: [18, 25, 33, 45, 67],
    },
    {
      key: 'salary',
      name: '薪资',
      type: 'number',
      nullable: false,
      unique: 100,
      min: 5000,
      max: 14900,
      avg: 9950,
      nullCount: 0,
      sampleValues: [5000, 7500, 10000, 12500, 14900],
    },
  ];

  useEffect(() => {
    loadData();
  }, [assetId, pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const pageData = mockData.slice(startIndex, endIndex);
      
      setData(pageData);
      setColumns(mockColumns);
      setPagination(prev => ({ ...prev, total: mockData.length }));
    } catch (error) {
      showError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // 实际项目中这里会调用API进行服务端搜索
    console.log('搜索:', value);
  };

  const handleExport = () => {
    const csvContent = generateCSV(data, columns);
    downloadCSV(csvContent, `data_export_${new Date().getTime()}.csv`);
    showSuccess('数据导出成功');
  };

  const generateCSV = (data: any[], columns: ColumnInfo[]) => {
    const headers = columns.map(col => col.name).join(',');
    const rows = data.map(row => 
      columns.map(col => row[col.key] || '').join(',')
    ).join('\n');
    return `${headers}\n${rows}`;
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

  const getColumnTypeColor = (type: string) => {
    switch (type) {
      case 'number': return 'blue';
      case 'string': return 'green';
      case 'date': return 'orange';
      case 'boolean': return 'purple';
      default: return 'default';
    }
  };

  const renderColumnSummary = (column: ColumnInfo) => (
    <Card size="small" style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Tag color={getColumnTypeColor(column.type)}>{column.type}</Tag>
          <Text strong>{column.name}</Text>
        </Space>
        <Tooltip title="查看详细统计">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
          />
        </Tooltip>
      </div>
      <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
        <Col span={8}>
          <Statistic title="唯一值" value={column.unique} size="small" />
        </Col>
        <Col span={8}>
          <Statistic title="空值" value={column.nullCount} size="small" />
        </Col>
        <Col span={8}>
          {column.type === 'number' && (
            <Statistic title="平均值" value={column.avg?.toFixed(1)} size="small" />
          )}
        </Col>
      </Row>
    </Card>
  );

  const tableColumns = columns.map(col => ({
    title: (
      <Space>
        <Tag color={getColumnTypeColor(col.type)} size="small">
          {col.type}
        </Tag>
        {col.name}
      </Space>
    ),
    dataIndex: col.key,
    key: col.key,
    width: 150,
    ellipsis: {
      showTitle: false,
    },
    render: (text: any) => (
      <Tooltip placement="topLeft" title={text}>
        {text}
      </Tooltip>
    ),
    sorter: col.type === 'number' ? (a: any, b: any) => a[col.key] - b[col.key] : true,
  }));

  return (
    <>
      <Card
        title={
          <Space>
            <BarChartOutlined />
            数据预览
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="搜索数据..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button icon={<FilterOutlined />} onClick={() => setFilterVisible(true)}>
              筛选
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
              设置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Statistic title="总行数" value={pagination.total} />
          </Col>
          <Col span={6}>
            <Statistic title="总列数" value={columns.length} />
          </Col>
          <Col span={6}>
            <Statistic title="当前页" value={`${pagination.current}/${Math.ceil(pagination.total / pagination.pageSize)}`} />
          </Col>
          <Col span={6}>
            <Statistic title="每页行数" value={pagination.pageSize} />
          </Col>
        </Row>

        <Table
          columns={tableColumns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
          scroll={{ x: 1200, y: 400 }}
          size="small"
        />
      </Card>

      {/* 字段统计侧边栏 */}
      <Drawer
        title="字段统计"
        placement="right"
        width={400}
        open={filterVisible}
        onClose={() => setFilterVisible(false)}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            显示每个字段的统计信息，包括数据类型、唯一值数量、空值统计等。
          </Text>
        </div>
        {columns.map(column => (
          <div key={column.key}>
            {renderColumnSummary(column)}
          </div>
        ))}
      </Drawer>

      {/* 设置抽屉 */}
      <Drawer
        title="显示设置"
        placement="right"
        width={300}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="每页显示行数">
            <Select
              value={pagination.pageSize}
              onChange={(value) => setPagination(prev => ({ ...prev, pageSize: value, current: 1 }))}
            >
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={200}>200</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="显示列">
            <Select
              mode="multiple"
              placeholder="选择要显示的列"
              value={selectedColumns}
              onChange={setSelectedColumns}
              style={{ width: '100%' }}
            >
              {columns.map(col => (
                <Select.Option key={col.key} value={col.key}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="启用虚拟滚动" tooltip="大数据量时提升性能">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item label="自动刷新间隔(秒)">
            <InputNumber min={0} max={300} placeholder="0表示不自动刷新" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default DataPreview;
