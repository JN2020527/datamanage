import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/Layout'
import HomePage from '@/pages/Home'
import DiscoveryPage from '@/pages/Discovery'
import AssetDetailPage from '@/pages/AssetDetail'
import SystemUsersPage from '@/pages/SystemUsers'
import './App.css'



export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/system/users" element={<SystemUsersPage />} />
      </Route>
    </Routes>
  )
}
