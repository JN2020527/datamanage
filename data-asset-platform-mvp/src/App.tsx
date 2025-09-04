import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/Layout'
import HomePage from '@/pages/Home'
import DiscoveryPage from '@/pages/Discovery'
import AssetDetailPage from '@/pages/AssetDetail'
import './App.css'


function SystemUsers() {
  return <div>系统-用户（占位）</div>
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/system/users" element={<SystemUsers />} />
      </Route>
    </Routes>
  )
}
