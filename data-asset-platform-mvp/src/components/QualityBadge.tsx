import { Tag } from 'antd'

interface Props {
  score: number
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export default function QualityBadge({ score, size = 'small', showLabel }: Props) {
  const color = score >= 90 ? 'green' : score >= 80 ? 'blue' : score >= 70 ? 'orange' : 'red'
  const fontSize = size === 'large' ? 16 : size === 'medium' ? 14 : 12
  return (
    <Tag color={color} style={{ fontSize, padding: '2px 6px' }}>
      {showLabel ? `质量 ${score}` : score}
    </Tag>
  )
}


