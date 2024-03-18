import { Button, Flex, Input, Layout, theme } from "antd"
import Title from "antd/es/typography/Title"
import { useSettings } from "../context/SettingsContext"
import { useEffect, useState } from "react"

// get some layout components
const { Header, Content } = Layout 

const SettingsPage: React.FC = () => {
    // some theming
    const { token: {colorBgContainer, borderRadiusLG} } = theme.useToken()

    // get the backend Settings
    const {backendUrl, updateBackendUrl } = useSettings()
    const [newUrl, setNewUrl] = useState<string>(backendUrl)

    // save only via function to decrease the load on the backend
    const saveBackendUrl = () => {
        updateBackendUrl(newUrl)
    }

    // update the url when changed externally
    useEffect(() => setNewUrl(backendUrl), [backendUrl])

    return <>
        <Layout>
            <Header style={{backgroundColor: colorBgContainer}}>
                <Title level={3}>Settings</Title>
            </Header>

            <Content style={{ width: 'auto', boxSizing: 'border-box', margin: '16px 24px', padding: '24px', height: '100%', overflowY: 'scroll', background: colorBgContainer, borderRadius: borderRadiusLG}}>
                <Title level={4}>Backend URL</Title>
                <Flex>
                    <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                    <Button onClick={() => saveBackendUrl()} disabled={backendUrl===newUrl}>Save</Button>
                </Flex>
                
            </Content>


        </Layout>
    </>
}

export default SettingsPage