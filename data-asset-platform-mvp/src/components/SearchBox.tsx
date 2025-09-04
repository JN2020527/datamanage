import { Input, Dropdown, Spin } from 'antd'
import type { MenuProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'

export interface SearchSuggestion {
  text: string
  type: 'asset' | 'field' | 'tag' | string
  category?: string
  count?: number
}

interface SearchBoxProps {
  placeholder?: string
  value?: string
  suggestions?: SearchSuggestion[]
  loading?: boolean
  onSearch?: (keyword: string) => void
  onChange?: (value: string) => void
  onSuggestionSelect?: (s: SearchSuggestion) => void
}

export default function SearchBox(props: SearchBoxProps) {
  const [keyword, setKeyword] = useState(props.value ?? '')

  const items: MenuProps['items'] = (props.suggestions ?? []).map((s, idx) => ({
    key: String(idx),
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: 220 }} onClick={() => props.onSuggestionSelect?.(s)}>
        <span>{s.text}</span>
        <span style={{ color: '#999' }}>{s.category ?? s.type}{s.count ? ` · ${s.count}` : ''}</span>
      </div>
    ),
  }))

  const content = (
    <Input.Search
      allowClear
      value={keyword}
      onChange={(e) => {
        setKeyword(e.target.value)
        props.onChange?.(e.target.value)
      }}
      onSearch={(v) => props.onSearch?.(v.trim())}
      placeholder={props.placeholder ?? '搜索数据资产、字段、标签...'}
      enterButton={<SearchOutlined />}
    />
  )

  if (props.loading) {
    return (
      <div style={{ position: 'relative' }}>
        {content}
        <Spin size="small" style={{ position: 'absolute', right: 10, top: 8 }} />
      </div>
    )
  }

  if (!items?.length) return content

  return (
    <Dropdown menu={{ items }} trigger={['click']} overlayStyle={{ maxHeight: 320, overflow: 'auto' }}>
      {content}
    </Dropdown>
  )
}


