import { Routes, Route, Link } from 'react-router-dom'
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
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">首页</Link>
        <Link to="/discovery">资产发现</Link>
        <Link to="/system/users">系统-用户</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/system/users" element={<SystemUsers />} />
      </Routes>
    </div>
  )
}
