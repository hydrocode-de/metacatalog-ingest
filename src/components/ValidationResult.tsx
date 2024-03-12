import { Avatar, Button, Flex, List, Result, Space, Spin } from "antd"
import { useData } from "../context/UploadDataContext"
import { UploadOutlined, WarningOutlined } from "@ant-design/icons"
import { useState } from "react"

const ValidationResult: React.FC = () => {
    // load the invalidation Messages and the state of the upload data from context
    const { isValid, invalidMessages, upload} = useData()

    // state to render that the metadata is currently being uploaded
    const [uploadStatus, setUploadStatus] = useState<'success' | 'fail' | 'pending' | 'loading'>('pending')
    const [uploadFeedback, setUploadFeedback] = useState<string>('')

    const handleUpload = () => {
        // reset the uploading status
        setUploadStatus('loading')
        setUploadFeedback('')

        // start upload
        upload().then(({status, message}) => {
            // upload finished, inform user
            setUploadStatus(status)
            setUploadFeedback(message)
        })
    }

    // check the upload status - if it is not pending anymore, show the result
    if (uploadStatus === 'loading') {
        return <>
            <Flex style={{width: '100%', minHeight: '120px'}} justify="center" align="center">
                <Flex justify="center" vertical>
                <Spin size="large" />
                <p>Uploading ...</p>
                </Flex>
            </Flex>
        </>
    } else if (uploadStatus !== 'pending') {
        return (<>
            <Result 
                status={uploadStatus === 'success' ? 'success' : 'error'}
                title={uploadStatus === 'success' ? 'Upload successful' : 'Upload failed'}
                subTitle={uploadFeedback}
                extra={
                    <Space>
                    <Button type="dashed" danger>Cancel everything</Button>
                    <Button type="primary" onClick={() => setUploadStatus('pending')}>Back</Button>
                    </Space>
                }
            />
        </>)
    }
    
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
        {/* result is not yet valid */}
        { !isValid ? <>
            <Result status="error" title="Your inputs are not valid" subTitle="Check the warnings below carefully and resolve them.">

            </Result>
        </> : <></>}

        {/* show the result depending on the state of the upload data */}
        { isValid && invalidMessages.length === 0 ? (<>
            <Result 
                status="info"
                title="Ready for upload, your metadata is valid."
                extra={
                    <Button type="primary" icon={<UploadOutlined />} size="large" onClick={() => handleUpload()}>Upload Metadata</Button>
                }
            />
        </>) : null}
        
        { isValid && invalidMessages.length > 0 ? (<>
            <Result 
                status="warning"
                title="There are still warnings, please check them carfully."
                extra={
                    <Button type="dashed" danger icon={<UploadOutlined />} size="large" onClick={() => handleUpload()}>Upload Metadata anyway</Button>
                }
            />
        </>) : null}
    
    </>)
}

export default ValidationResult