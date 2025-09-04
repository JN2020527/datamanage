import { Card, Typography, Space, Button } from 'antd'
import QualityBadge from './QualityBadge'

interface AssetCardProps {
  asset: {
    id: string
    name: string
    type: 'table' | 'model' | 'report' | 'dashboard' | string
    description?: string
    owner?: { name?: string; avatar?: string }
    tags?: string[]
    qualityScore?: number
    updateTime?: string
    accessCount?: number
  }
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export default function AssetCard({ asset, onView, onEdit }: AssetCardProps) {
  return (
    <Card title={asset.name} extra={<span>{asset.type}</span>} style={{ width: 320 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {asset.description && <Typography.Paragraph ellipsis={{ rows: 2 }}>{asset.description}</Typography.Paragraph>}
        <Space size={8}>
          {typeof asset.qualityScore === 'number' && <QualityBadge score={asset.qualityScore} />}
          {typeof asset.accessCount === 'number' && (
            <Typography.Text type="secondary">👁 {asset.accessCount}</Typography.Text>
          )}
        </Space>
        <Space>
          <Button type="link" onClick={() => onView?.(asset.id)}>查看</Button>
          <Button type="link" onClick={() => onEdit?.(asset.id)}>编辑</Button>
        </Space>
      </Space>
    </Card>
  )
}


