import { useEffect, useState } from 'react'
import { Card, Table } from 'antd'
import { getUsers } from '@/utils/api'

export default function SystemUsersPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await getUsers()
        setData(data?.data ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card title="用户列表" bordered={false}>
      <Table
        rowKey={(r) => r.id}
        loading={loading}
        dataSource={data}
        columns={[
          { title: '用户名', dataIndex: 'username' },
          { title: '姓名', dataIndex: 'name' },
          { title: '部门', dataIndex: 'department' },
          { title: '角色', dataIndex: 'roleName' },
          { title: '状态', dataIndex: 'status' },
        ]}
      />
    </Card>
  )
}


