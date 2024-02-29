import { useSignal } from "@preact/signals-react"
import { Layout, Menu, theme } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import Title from "antd/es/typography/Title"
import UploadForm from "./UploadForm"

const {  Header, Sider, Content } = Layout

function App() {
  const collapsed = useSignal(false)

  // get the design
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  return (
    <>
      <Layout style={{minHeight: '100vh'}}>
        <Sider collapsible defaultCollapsed  onCollapse={value => collapsed.value = value}>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {key: '1', label: 'Upload Metadata', icon: <UploadOutlined />},
            ]}
          />
        </Sider>

        <Layout>
            <Header style={{ background: colorBgContainer, padding: 0 }}>
              <Title level={3} style={{padding: '0 24px'}}>Metadata Uploader</Title>
            </Header>

            <Content style={{margin: '16px 24px', padding: '24px', height: '100%', background: colorBgContainer, borderRadius: borderRadiusLG}}>
              <UploadForm />
            </Content>
        </Layout>

      </Layout>

    </>
  )
}

export default App
