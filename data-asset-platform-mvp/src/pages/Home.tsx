import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Space } from 'antd'
import ChartContainer from '@/components/ChartContainer'
import { getDashboardStatistics } from '@/utils/api'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const { data } = await getDashboardStatistics()
        setStats(data.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const summary = stats?.summary
  const assetByType = stats?.assetDistribution?.byType ?? []
  const accessDaily = stats?.accessTrends?.daily ?? []

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Row gutter={16}>
        <Col span={6}>
          <Card loading={loading}><Statistic title="总资产" value={summary?.totalAssets?.current ?? 0} /></Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}><Statistic title="平均质量" value={summary?.avgQualityScore?.current ?? 0} suffix="分" /></Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <ChartContainer title="资产类型分布" type="pie" data={assetByType} config={{ angleField: 'count', colorField: 'type' }} />
        </Col>
        <Col span={16}>
          <ChartContainer title="访问趋势" type="line" data={accessDaily} config={{ xField: 'date', yField: 'accessCount', smooth: true }} />
        </Col>
      </Row>
    </Space>
  )
}


