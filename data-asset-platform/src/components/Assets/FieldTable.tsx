import React from 'react';
import { Table, Tag, Tooltip, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { Field } from '@types/index';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface FieldTableProps {
  fields: Field[];
  loading?: boolean;
}

const FieldTable: React.FC<FieldTableProps> = ({ fields, loading = false }) => {
  const columns: ColumnsType<Field> = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (name: string, record: Field) => (
        <div>
          <Text strong style={{ display: 'block' }}>
            {name}
          </Text>
          {record.id && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.id}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: '是否必填',
      dataIndex: 'required',
      key: 'required',
      width: 100,
      align: 'center',
      render: (required: boolean) => (
        <div style={{ textAlign: 'center' }}>
          {required ? (
            <Tooltip title="必填字段">
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            </Tooltip>
          ) : (
            <Tooltip title="可选字段">
              <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: '16px' }} />
            </Tooltip>
          )}
        </div>
      ),
      filters: [
        { text: '必填', value: true },
        { text: '可选', value: false },
      ],
      onFilter: (value: any, record) => record.required === value,
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (defaultValue?: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {defaultValue || '-'}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div style={{ maxWidth: '300px' }}>
          <Text style={{ fontSize: '14px' }}>{description}</Text>
        </div>
      ),
    },
    {
      title: '约束条件',
      dataIndex: 'constraints',
      key: 'constraints',
      width: 200,
      render: (constraints?: string[]) => (
        <div>
          {constraints && constraints.length > 0 ? (
            constraints.map((constraint, index) => (
              <Tag
                key={index}
                size="small"
                color="orange"
                style={{ marginBottom: '2px', display: 'block', width: 'fit-content' }}
              >
                {constraint}
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={fields}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条字段`,
        pageSizeOptions: ['10', '20', '50'],
      }}
      scroll={{ x: 1000 }}
      size="middle"
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
      rowClassName={(record, index) =>
        index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
      }
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>字段详细信息:</Text>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Text type="secondary">字段ID:</Text>
                <Text style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                  {record.id}
                </Text>
              </div>
              <div>
                <Text type="secondary">数据类型:</Text>
                <Text style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                  {record.type}
                </Text>
              </div>
              <div>
                <Text type="secondary">是否必填:</Text>
                <Text style={{ marginLeft: '8px' }}>
                  {record.required ? '是' : '否'}
                </Text>
              </div>
              <div>
                <Text type="secondary">默认值:</Text>
                <Text style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                  {record.defaultValue || '无'}
                </Text>
              </div>
            </div>
            {record.description && (
              <div style={{ marginTop: '12px' }}>
                <Text type="secondary">描述:</Text>
                <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
                  <Text>{record.description}</Text>
                </div>
              </div>
            )}
            {record.constraints && record.constraints.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <Text type="secondary">约束条件:</Text>
                <div style={{ marginTop: '4px' }}>
                  {record.constraints.map((constraint, index) => (
                    <Tag key={index} color="orange" style={{ margin: '2px' }}>
                      {constraint}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
        expandIcon: ({ expanded, onExpand, record }) => (
          <Tooltip title={expanded ? '收起详情' : '展开详情'}>
            <InfoCircleOutlined
              style={{
                color: expanded ? '#1677ff' : '#d9d9d9',
                cursor: 'pointer',
                fontSize: '16px',
              }}
              onClick={(e) => onExpand(record, e)}
            />
          </Tooltip>
        ),
      }}
    />
  );
};

export default FieldTable;
