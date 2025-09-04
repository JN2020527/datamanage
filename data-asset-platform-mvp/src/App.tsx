import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/Layout'
import './App.css'

function Home() {
  return <div>首页概览（占位）</div>
}

function Discovery() {
  return <div>资产发现（占位）</div>
}

function SystemUsers() {
  return <div>系统-用户（占位）</div>
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/system/users" element={<SystemUsers />} />
      </Route>
    </Routes>
  )
}
