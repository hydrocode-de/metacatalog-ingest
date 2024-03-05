import { useState } from "react"
import { useSignal } from "@preact/signals-react"
import { Flex, Input, Layout, Menu, theme } from "antd"
import Title from "antd/es/typography/Title"
import { UploadOutlined } from "@ant-design/icons"

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
          <Header>

          </Header>
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
              <Flex>
              <Title level={3} style={{padding: '0 24px'}}>Metadata Uploader</Title>
              </Flex>
            </Header>

            <Content style={{ width: 'auto', boxSizing: 'border-box', margin: '16px 24px', padding: '24px', height: '100%', overflowY: 'scroll', background: colorBgContainer, borderRadius: borderRadiusLG}}>
              
              <UploadForm />
            </Content>
        </Layout>

      </Layout>

    </>
  )
}

export default App
