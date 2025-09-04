import { create } from 'zustand';
import type { User, Asset, Statistics } from '@types/index';

interface AppState {
  // 用户状态
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // 导航状态
  currentPath: string;
  activeMenu: string;
  sidebarCollapsed: boolean;
  breadcrumbs: Array<{ title: string; path?: string }>;
  
  // 数据状态
  assets: Asset[];
  statistics: Statistics | null;
  loading: boolean;
  
  // 搜索状态
  searchKeyword: string;
  searchHistory: string[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  setCurrentPath: (path: string) => void;
  setActiveMenu: (menu: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => void;
  setAssets: (assets: Asset[]) => void;
  setStatistics: (statistics: Statistics) => void;
  setLoading: (loading: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  currentPath: '/',
  activeMenu: 'home',
  sidebarCollapsed: false,
  breadcrumbs: [{ title: '首页', path: '/' }],
  assets: [],
  statistics: null,
  loading: false,
  searchKeyword: '',
  searchHistory: [],

  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  
  setCurrentPath: (path) => set({ currentPath: path }),
  
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  setAssets: (assets) => set({ assets }),
  
  setStatistics: (statistics) => set({ statistics }),
  
  setLoading: (loading) => set({ loading }),
  
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  addSearchHistory: (keyword) => {
    const { searchHistory } = get();
    if (keyword && !searchHistory.includes(keyword)) {
      const newHistory = [keyword, ...searchHistory].slice(0, 10); // 保留最近10条
      set({ searchHistory: newHistory });
    }
  },
  
  clearSearchHistory: () => set({ searchHistory: [] }),
}));
