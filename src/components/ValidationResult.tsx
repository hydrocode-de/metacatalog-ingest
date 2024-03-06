import { Avatar, Button, List, Result } from "antd"
import { useData } from "../context/UploadDataContext"
import { UploadOutlined, WarningOutlined } from "@ant-design/icons"

const ValidationResult: React.FC = () => {
    // load the invalidation Messages and the state of the upload data from context
    const { metadata, isValid, invalidMessages} = useData()
    
    return (<>
        {/* if there are invalidation Messages, show them */}
        { invalidMessages.length > 0 ? (<>
            <List 
                //bordered
                size="small"
                style={{marginTop: '1rem'}}
                //header="Validation Errors"
                dataSource={invalidMessages}
                renderItem={item => (
                    <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar 
                            icon={item.type === 'error' ? <WarningOutlined /> : <WarningOutlined />} 
                            style={{backgroundColor: item.type === 'error' ? 'red' : 'orange'}}
                        />}
                        title={item.type === 'error' ? 'Validation Error' : 'Warning'}
                        description={item.message}
                    />
                    </List.Item>
                )}
            />
        </>) : null}

        {/* show the result depending on the state of the upload data */}
        { isValid && invalidMessages.length === 0 ? (<>
            <Result 
                status="info"
                title="Ready for upload, your metadata is valid."
                extra={
                    <Button type="primary" icon={<UploadOutlined />} size="large" onClick={() => console.log(metadata)}>Upload Metadata</Button>
                }
            />
        </>) : null}
        
        { isValid && invalidMessages.length > 0 ? (<>
            <Result 
                status="warning"
                title="There are still warnings, please check them carfully."
                extra={
                    <Button type="dashed" danger icon={<UploadOutlined />} size="large" onClick={() => console.log(metadata)}>Upload Metadata anyway</Button>
                }
            />
        </>) : null}
    
    </>)
}

export default ValidationResult