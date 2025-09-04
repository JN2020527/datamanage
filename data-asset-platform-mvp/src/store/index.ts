import { create } from 'zustand'
import type { Asset, UserProfile, QualityReport } from '@/types'

type LoadingState = {
  loading: boolean
  error?: string | null
}

type AssetListState = LoadingState & {
  items: Asset[]
  total: number
  page: number
  pageSize: number
}

type SearchState = {
  keyword: string
  suggestions: Array<{ text: string; type: string; category?: string; count?: number }>
  searching: boolean
}

type UserState = LoadingState & {
  profile?: UserProfile
}

type QualityState = LoadingState & {
  report?: QualityReport
}

type GlobalStore = {
  assets: AssetListState
  search: SearchState
  user: UserState
  quality: QualityState
  set: (partial: Partial<GlobalStore>) => void
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  assets: { items: [], total: 0, page: 1, pageSize: 20, loading: false },
  search: { keyword: '', suggestions: [], searching: false },
  user: { loading: false },
  quality: { loading: false },
  set: (partial) => set(partial),
}))


