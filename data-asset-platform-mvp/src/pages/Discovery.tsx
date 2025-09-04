import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Segmented, Space, Empty, Spin } from 'antd'
import SearchBox, { type SearchSuggestion } from '@/components/SearchBox'
import AssetCard from '@/components/AssetCard'
import DataTable, { type ColumnDefinition } from '@/components/DataTable'
import { getAssets, getSearchSuggestions } from '@/utils/api'
import type { Asset } from '@/types'
import { debounce } from 'lodash-es'

export default function DiscoveryPage() {
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [view, setView] = useState<'card' | 'table'>('card')
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  const fetchAssets = async (kw?: string) => {
    setLoading(true)
    try {
      const { data } = await getAssets({ q: kw } as any)
      setAssets(Array.isArray(data) ? data : data.data?.list ?? data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const doSuggest = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q?.trim()) {
          setSuggestions([])
          return
        }
        try {
          const { data } = await getSearchSuggestions(q)
          const list = data?.data?.suggestions ?? []
          setSuggestions(list)
        } catch {
          setSuggestions([])
        }
      }, 300),
    []
  )

  const columns: ColumnDefinition<Asset> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 220 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '负责人', dataIndex: ['owner', 'name'], key: 'owner', width: 160 },
    { title: '质量', dataIndex: 'qualityScore', key: 'qualityScore', width: 100 },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <SearchBox
            value={keyword}
            onChange={(v) => {
              setKeyword(v)
              doSuggest(v)
            }}
            onSearch={(v) => fetchAssets(v)}
            suggestions={suggestions}
            onSuggestionSelect={(s) => fetchAssets(s.text)}
          />
        </Col>
        <Col>
          <Segmented
            value={view}
            onChange={(val) => setView(val as any)}
            options={[{ label: '卡片', value: 'card' }, { label: '列表', value: 'table' }]}
          />
        </Col>
      </Row>

      {loading ? (
        <Spin />
      ) : assets.length === 0 ? (
        <Empty description="暂无资产" />
      ) : view === 'card' ? (
        <Row gutter={[16, 16]}>
          {assets.map((a) => (
            <Col key={a.id} xs={24} sm={12} md={8} lg={6} xl={6}>
              <AssetCard asset={{
                id: a.id,
                name: a.name,
                type: a.type,
                description: a.description,
                owner: { name: a.owner?.name },
                tags: a.tags,
                qualityScore: a.qualityScore,
                accessCount: a.accessCount,
              }} />
            </Col>
          ))}
        </Row>
      ) : (
        <DataTable<Asset>
          columns={columns}
          data={assets}
          rowKey={(r) => r.id}
        />
      )}
    </Space>
  )
}


