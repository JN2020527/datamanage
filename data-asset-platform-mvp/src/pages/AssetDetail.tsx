import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Tabs, Descriptions, Tag, Space, Table } from 'antd'
import { getAssetDetail, getAssetFields, getAssetLineage, getAssetQuality } from '@/utils/api'
import LineageGraph from '@/components/LineageGraph'
import QualityBadge from '@/components/QualityBadge'

export default function AssetDetailPage() {
  const { id = '' } = useParams()
  const [detail, setDetail] = useState<any>()
  const [fields, setFields] = useState<any[]>([])
  const [lineage, setLineage] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] })
  const [quality, setQuality] = useState<any>()

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [d, f, l, q] = await Promise.all([
        getAssetDetail(id),
        getAssetFields(id),
        getAssetLineage(id, { direction: 'both', depth: 3 }),
        getAssetQuality(id),
      ])
      setDetail(d.data.data)
      setFields(Array.isArray(f.data.data) ? f.data.data : [])
      const lineageData = l.data.data
      setLineage({ nodes: lineageData?.nodes ?? [], edges: lineageData?.edges ?? [] })
      setQuality(q.data.data)
    })()
  }, [id])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card title={<Space>{detail?.name}<QualityBadge score={detail?.qualityScore ?? 0} /></Space>} extra={<Link to="/discovery">返回</Link>}>
        <Descriptions column={3}>
          <Descriptions.Item label="类型">{detail?.type}</Descriptions.Item>
          <Descriptions.Item label="库/Schema">{detail?.database}/{detail?.schema}</Descriptions.Item>
          <Descriptions.Item label="负责人">{detail?.owner?.name}</Descriptions.Item>
          <Descriptions.Item label="更新频率">{detail?.updateFrequency}</Descriptions.Item>
          <Descriptions.Item label="访问次数">{detail?.accessCount}</Descriptions.Item>
          <Descriptions.Item label="标签">{(detail?.tags ?? []).map((t: string) => <Tag key={t}>{t}</Tag>)}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Tabs
        items={[
          {
            key: 'fields',
            label: '字段',
            children: (
              <Table
                size="small"
                rowKey={(r) => r.id}
                dataSource={fields}
                columns={[
                  { title: '字段名', dataIndex: 'name' },
                  { title: '显示名', dataIndex: 'displayName' },
                  { title: '类型', dataIndex: 'dataType' },
                  { title: '主键', dataIndex: 'isPrimaryKey', render: (v) => (v ? '是' : '否') },
                  { title: '必填', dataIndex: 'isRequired', render: (v) => (v ? '是' : '否') },
                ]}
              />
            ),
          },
          {
            key: 'lineage',
            label: '血缘',
            children: <LineageGraph data={lineage} />,
          },
          {
            key: 'quality',
            label: '质量',
            children: (
              <Card>
                <p>总体分数：{quality?.overallScore}</p>
                <p>状态：{quality?.status}</p>
              </Card>
            ),
          },
        ]}
      />
    </Space>
  )
}


