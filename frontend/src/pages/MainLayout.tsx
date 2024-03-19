import { Flex, Layout, Menu, theme } from "antd"
import { SettingOutlined, UploadOutlined } from "@ant-design/icons"
import { Outlet, Link } from "react-router-dom"

import { version } from "../../package.json"


// get some layout props
const {  Header, Sider } = Layout


const MainLayout: React.FC = () => {
    const { token: {colorTextLightSolid } } = theme.useToken()
    return <>
        <Layout style={{minHeight: '100vh', maxHeight: '100vh'}}>
            <Sider collapsible>
            <Header style={{color: colorTextLightSolid}}>
                <Flex vertical>
                
                <div>Version: {version} </div>
                </Flex>

            </Header>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                items={[
                {key: '1', label: <Link to="/">Upload Metadata</Link>, icon: <UploadOutlined />},
                {key: '2', label: <Link to="/settings">Settings</Link>, icon: <SettingOutlined />, },
                ]}
            />
            </Sider>
            
            <Outlet />

        </Layout>
    </>
}

export default MainLayout