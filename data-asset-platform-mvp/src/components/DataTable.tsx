import { Table } from 'antd'
import type { TableProps } from 'antd'

export type ColumnDefinition<T> = TableProps<T>['columns']

interface DataTableProps<T> {
  columns: ColumnDefinition<T>
  data: T[]
  loading?: boolean
  pagination?: TableProps<T>['pagination']
  rowKey?: string | ((record: T) => string)
}

export default function DataTable<T extends object>({ columns, data, loading, pagination, rowKey }: DataTableProps<T>) {
  return (
    <Table<T>
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      rowKey={rowKey as any}
    />
  )
}


