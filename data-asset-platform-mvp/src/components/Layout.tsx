import { Layout, Menu } from 'antd'
import { Link, Outlet } from 'react-router-dom'
import '@/styles/globals.less'

const { Header, Content, Footer } = Layout

export default function AppLayout() {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#fff', fontWeight: 600 }}>数据资产平台</div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={[
              { key: 'home', label: <Link to="/">首页</Link> },
              { key: 'discovery', label: <Link to="/discovery">资产发现</Link> },
              { key: 'system-users', label: <Link to="/system/users">系统-用户</Link> },
            ]}
          />
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
      <Footer className="app-footer">© {new Date().getFullYear()} 数据资产平台</Footer>
    </Layout>
  )
}

