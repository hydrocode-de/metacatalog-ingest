import { Layout, Menu } from "antd"
import { UploadOutlined, SettingOutlined } from "@ant-design/icons"

import UploadPage from "./pages/UploadPage"


const {  Header, Sider } = Layout

function App() {
  return (
    <>
      <Layout style={{minHeight: '100vh'}}>
        <Sider collapsible>
          <Header>

          </Header>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {key: '1', label: 'Upload Metadata', icon: <UploadOutlined />},
              {key: '2', label: 'Settings', icon: <SettingOutlined />},
            ]}
          />
        </Sider>

        <UploadPage />

      </Layout>

    </>
  )
}

export default App
