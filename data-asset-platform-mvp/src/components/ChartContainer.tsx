import type React from 'react'
import { Card } from 'antd'
import { Line, Column, Pie } from '@ant-design/charts'

type ChartType = 'line' | 'bar' | 'pie'

interface Props {
  title?: string
  type: ChartType
  data: any[]
  config?: Record<string, any>
  height?: number
}

export default function ChartContainer({ title, type, data, config, height = 260 }: Props) {
  const common = { data, height }
  let chart: React.ReactNode = null
  if (type === 'line') chart = <Line {...common} {...config} />
  if (type === 'bar') chart = <Column {...common} {...config} />
  if (type === 'pie') chart = <Pie {...common} {...config} />
  return <Card title={title}>{chart}</Card>
}


