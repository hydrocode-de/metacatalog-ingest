import { Flex, Layout , theme} from "antd";
import Title from "antd/es/typography/Title";
import UploadForm from "../components/UploadForm";
import { UploadDataProvider } from "../context/UploadDataContext";
import DebugButton from "../components/DebugButton";

const {  Header, Content } = Layout

const UploadPage: React.FC = () => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

    return (<>
        <UploadDataProvider>
            <Layout>
                <Header style={{ background: colorBgContainer, padding: 0 }}>
                <Flex>
                <Title level={3} style={{padding: '0 24px'}}>Metadata Uploader</Title>
                </Flex>
                </Header>

                <Content style={{ width: 'auto', boxSizing: 'border-box', margin: '16px 24px', padding: '24px', height: '100%', overflowY: 'scroll', background: colorBgContainer, borderRadius: borderRadiusLG}}>
                
                <UploadForm />

                <DebugButton /> 

                </Content>
            </Layout>
        </UploadDataProvider>
    </>)
}

export default UploadPage;