import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tooltip,
  Typography,
  Tag,
  Pagination,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  Empty,
  Dropdown,
  Switch,
  Slider,
  Divider
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  TableOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// 模拟数据接口
interface DataRecord {
  id: string;
  user_id: string;
  session_id: string;
  event_source_id: string;
  page_views: number;
  session_duration: number;
  bounce_rate: number;
  conversion_events: number;
  last_updated: string;
  created_at: string;
  device_type: string;
  browser: string;
  location: string;
  channel: string;
}

// 生成模拟数据
const generateMockData = (total: number = 1000): DataRecord[] => {
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉'];
  const channels = ['直接访问', '搜索引擎', '社交媒体', '邮件营销', '付费广告'];

  return Array.from({ length: total }, (_, index) => ({
    id: `record_${String(index + 1).padStart(6, '0')}`,
    user_id: `user_${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    session_id: `session_${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
    event_source_id: `source_${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
    page_views: Math.floor(Math.random() * 50) + 1,
    session_duration: Math.floor(Math.random() * 3600) + 60,
    bounce_rate: Number((Math.random() * 100).toFixed(2)),
    conversion_events: Math.floor(Math.random() * 10),
    last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    device_type: devices[Math.floor(Math.random() * devices.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    channel: channels[Math.floor(Math.random() * channels.length)]
  }));
};

const DataPreview: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [tableSize, setTableSize] = useState<'small' | 'middle' | 'large'>('middle');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'stats'>('table');

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockData(1000);
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    };

    loadData();
  }, []);

  // 列定义
  const allColumns: ColumnsType<DataRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
      render: (text) => (
        <Text code style={{ fontSize: '12px' }}>{text}</Text>
      )
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 100, color: '#1890ff' }}>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '会话ID',
      dataIndex: 'session_id',
      key: 'session_id',
      width: 140,
      render: (text) => (
        <Text ellipsis style={{ maxWidth: 120, color: '#52c41a' }}>{text}</Text>
      )
    },
    {
      title: '事件来源ID',
      dataIndex: 'event_source_id',
      key: 'event_source_id',
      width: 120,
      render: (text) => (
        <Text ellipsis style={{ maxWidth: 100 }}>{text}</Text>
      )
    },
    {
      title: '页面浏览量',
      dataIndex: 'page_views',
      key: 'page_views',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.page_views - b.page_views,
      render: (value) => (
        <Text strong style={{ color: value > 20 ? '#f5222d' : '#52c41a' }}>
          {value.toLocaleString()}
        </Text>
      )
    },
    {
      title: '会话时长(秒)',
      dataIndex: 'session_duration',
      key: 'session_duration',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.session_duration - b.session_duration,
      render: (value) => (
        <Text>{Math.floor(value / 60)}分{value % 60}秒</Text>
      )
    },
    {
      title: '跳出率(%)',
      dataIndex: 'bounce_rate',
      key: 'bounce_rate',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.bounce_rate - b.bounce_rate,
      render: (value) => (
        <Text style={{ color: value > 50 ? '#f5222d' : '#52c41a' }}>
          {value}%
        </Text>
      )
    },
    {
      title: '转化事件数',
      dataIndex: 'conversion_events',
      key: 'conversion_events',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.conversion_events - b.conversion_events,
      render: (value) => (
        <Tag color={value > 5 ? 'success' : value > 2 ? 'warning' : 'default'}>
          {value}
        </Tag>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'device_type',
      key: 'device_type',
      width: 100,
      filters: [
        { text: 'Desktop', value: 'Desktop' },
        { text: 'Mobile', value: 'Mobile' },
        { text: 'Tablet', value: 'Tablet' }
      ],
      onFilter: (value, record) => record.device_type === value,
      render: (text) => (
        <Tag color={
          text === 'Desktop' ? 'blue' :
          text === 'Mobile' ? 'green' : 'orange'
        }>
          {text}
        </Tag>
      )
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 100,
      filters: [
        { text: 'Chrome', value: 'Chrome' },
        { text: 'Firefox', value: 'Firefox' },
        { text: 'Safari', value: 'Safari' },
        { text: 'Edge', value: 'Edge' }
      ],
      onFilter: (value, record) => record.browser === value,
      render: (text) => <Text>{text}</Text>
    },
    {
      title: '地理位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (text) => (
        <Tag color="geekblue">{text}</Tag>
      )
    },
    {
      title: '渠道来源',
      dataIndex: 'channel',
      key: 'channel',
      width: 120,
      render: (text) => (
        <Tag color="purple">{text}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (text) => (
        <Text style={{ fontSize: '12px' }}>
          {new Date(text).toLocaleString()}
        </Text>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'last_updated',
      key: 'last_updated',
      width: 160,
      sorter: (a, b) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime(),
      render: (text) => (
        <Text style={{ fontSize: '12px', color: '#666' }}>
          {new Date(text).toLocaleString()}
        </Text>
      )
    }
  ];

  // 初始化显示的列
  useEffect(() => {
    setSelectedColumns([
      'id', 'user_id', 'session_id', 'page_views', 
      'session_duration', 'bounce_rate', 'device_type', 'created_at'
    ]);
  }, []);

  // 过滤显示的列
  const displayColumns = useMemo(() => {
    if (selectedColumns.length === 0) return allColumns;
    return allColumns.filter(col => selectedColumns.includes(col.key as string));
  }, [selectedColumns, allColumns]);

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (!value.trim()) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const filtered = data.filter(record =>
      Object.values(record).some(field =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newData = generateMockData(1000);
    setData(newData);
    setFilteredData(newData);
    setRefreshing(false);
  };

  // 导出数据
  const handleExport = () => {
    const csvContent = [
      allColumns.map(col => col.title).join(','),
      ...filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .map(record => allColumns.map(col => record[col.key as keyof DataRecord]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_behavior_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 列选择器
  const columnSelector = (
    <Card size="small" style={{ width: 300 }}>
      <div style={{ marginBottom: 12 }}>
        <Text strong>显示列设置</Text>
        <div style={{ marginTop: 8 }}>
          <Button 
            size="small" 
            onClick={() => setSelectedColumns(allColumns.map(col => col.key as string))}
            style={{ marginRight: 8 }}
          >
            全选
          </Button>
          <Button 
            size="small" 
            onClick={() => setSelectedColumns([])}
          >
            清空
          </Button>
        </div>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {allColumns.map(col => (
          <div key={col.key} style={{ marginBottom: 4 }}>
            <Switch
              size="small"
              checked={selectedColumns.includes(col.key as string)}
              onChange={(checked) => {
                if (checked) {
                  setSelectedColumns([...selectedColumns, col.key as string]);
                } else {
                  setSelectedColumns(selectedColumns.filter(key => key !== col.key));
                }
              }}
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 12 }}>{col.title as string}</Text>
          </div>
        ))}
      </div>
    </Card>
  );

  // 计算统计信息
  const stats = useMemo(() => {
    const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return {
      totalRecords: filteredData.length,
      avgPageViews: currentData.reduce((sum, record) => sum + record.page_views, 0) / currentData.length,
      avgSessionDuration: currentData.reduce((sum, record) => sum + record.session_duration, 0) / currentData.length,
      avgBounceRate: currentData.reduce((sum, record) => sum + record.bounce_rate, 0) / currentData.length,
      totalConversions: currentData.reduce((sum, record) => sum + record.conversion_events, 0)
    };
  }, [filteredData, currentPage, pageSize]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: 12,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}
      >
        <Row gutter={[16, 8]} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Search
                placeholder="搜索数据..."
                style={{ width: 300 }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                allowClear
              />
              
              <Select
                value={pageSize}
                onChange={setPageSize}
                style={{ width: 120 }}
                size="small"
              >
                <Option value={20}>20条/页</Option>
                <Option value={50}>50条/页</Option>
                <Option value={100}>100条/页</Option>
                <Option value={200}>200条/页</Option>
              </Select>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Tooltip title="切换视图">
                <Button
                  size="small"
                  icon={viewMode === 'table' ? <BarChartOutlined /> : <TableOutlined />}
                  onClick={() => setViewMode(viewMode === 'table' ? 'stats' : 'table')}
                >
                  {viewMode === 'table' ? '统计' : '表格'}
                </Button>
              </Tooltip>
              
              <Dropdown overlay={columnSelector} trigger={['click']} placement="bottomRight">
                <Button size="small" icon={<SettingOutlined />}>
                  列设置
                </Button>
              </Dropdown>
              
              <Tooltip title="表格大小">
                <Select
                  value={tableSize}
                  onChange={setTableSize}
                  style={{ width: 80 }}
                  size="small"
                >
                  <Option value="small">紧凑</Option>
                  <Option value="middle">默认</Option>
                  <Option value="large">宽松</Option>
                </Select>
              </Tooltip>
              
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                title="刷新数据"
              />
              
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                title="导出当前页数据"
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 统计信息栏 */}
        {searchValue && (
          <Alert
            message={`搜索结果：共找到 ${filteredData.length} 条记录`}
            type="info"
            showIcon
            style={{ marginTop: 8 }}
            closable
          />
        )}
      </Card>

      {/* 主要内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'table' ? (
          /* 数据表格 */
          <Card 
            style={{ 
              height: '100%',
              borderRadius: 0,
              border: 'none'
            }}
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            <Spin spinning={loading}>
              <Table
                columns={displayColumns}
                dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                rowKey="id"
                size={tableSize}
                scroll={{ x: 1500, y: 'calc(100vh - 300px)' }}
                pagination={false}
                loading={loading}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无数据"
                    />
                  )
                }}
                                 rowSelection={{
                   type: 'checkbox',
                   onSelectAll: (selected, selectedRows, changeRows) => {
                     console.log('Select all:', selected, selectedRows, changeRows);
                   },
                   onSelect: (record, selected, selectedRows) => {
                     console.log('Select:', record, selected, selectedRows);
                   }
                 }}
              />
            </Spin>
          </Card>
        ) : (
          /* 统计视图 */
          <Card style={{ height: '100%', borderRadius: 0, border: 'none' }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="总记录数"
                  value={stats.totalRecords}
                  prefix={<TableOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均页面浏览量"
                  value={stats.avgPageViews}
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均会话时长"
                  value={stats.avgSessionDuration}
                  precision={0}
                  suffix="秒"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均跳出率"
                  value={stats.avgBounceRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Title level={5}>当前页数据概览</Title>
            <Text type="secondary">
              显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} 条，
              共 {filteredData.length} 条记录
            </Text>
          </Card>
        )}
      </div>

      {/* 分页器 */}
      <div style={{ 
        padding: '16px 24px', 
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text type="secondary">
              共 {filteredData.length} 条记录，显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} 条
            </Text>
          </Col>
          <Col>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(1);
                }
              }}
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
              pageSizeOptions={['20', '50', '100', '200']}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DataPreview;
