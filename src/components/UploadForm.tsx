import {  useState } from 'react';
import {   Badge, Button, Checkbox, Collapse, Flex,  Form, Input, Table, UploadFile } from 'antd';
import { UploadOutlined, DeleteFilled } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import Title from 'antd/es/typography/Title';

import { useSettings } from '../context/SettingsContext'
import DataPropertiesForm from './DataPropertiesForm';
import { useData } from '../context/UploadDataContext';
import AuthorSelectForm from './AuthorSelectForm';
import MandatoryLookupForm from './MandatoryLookupForm';
import ValidationResult from './ValidationResult';

const { TextArea } = Input;


const UploadForm: React.FC = () => {
    // get the current backend url
    const { backendUrl } = useSettings()
    const { metadata, invalidMessages, updateMetadata} = useData()

    // uploaded files
    const [file, setFile] = useState<UploadFile>()

    // details
    const [details, setDetails] = useState<{detailKey: string, detailValue: string}[]>([])
    const [ detailForm ] = Form.useForm()


    const onAddDetail = (newDetail: {detailKey: string, detailValue: string}) => {
        setDetails([...details, newDetail])
        detailForm.resetFields()
    }


    return (
        <>
            <Dragger
                style={{maxHeight: '150px'}}
                accept=".csv,.nc"
                //multiple
                beforeUpload={() => false}
                onChange={info => info.fileList.length > 0 ? setFile(info.fileList[0]) : setFile(undefined)}
                onRemove={() => setFile(undefined)}
            >
                <Button icon={<UploadOutlined />}>Select Files</Button>
            </Dragger>
            
            <Badge.Ribbon text={invalidMessages.length} color="red">
            <Collapse defaultActiveKey='validation'>
                <Collapse.Panel key="validation" header="Validation and Upload">
                    <ValidationResult />
                </Collapse.Panel>
            </Collapse>
            </Badge.Ribbon>

            <Title level={2}>{metadata.title || 'Metadata'}</Title>

            <Collapse>
                <Collapse.Panel key="main_info" header="General Information">
                    <Input addonBefore="Title" placeholder="Unique descriptive Dataset title" value={metadata.title} onChange={e => updateMetadata('title', e.target.value)} />
                    <TextArea placeholder="Abstract" autoSize={{minRows: 5, maxRows: 10}} value={metadata.abstract} onChange={e => updateMetadata('abstract', e.target.value)} />
                    <Collapse>
                        <Collapse.Panel key="external_id" header="Optional Attributes">
                            <Input placeholder="optional ID by external data provider" addonBefore="External ID" />
                            <Checkbox>Embargo dataset for 2 years (NOT RECOMMENDED)</Checkbox>
                        </Collapse.Panel>
                    </Collapse>

                    <Title level={4}>Authors</Title>
                    <AuthorSelectForm />
                </Collapse.Panel>
            </Collapse>

            <Collapse>
                <Collapse.Panel key="metadata" header="Dataset Metadata">
                    <MandatoryLookupForm />

                    <Title level={5}>Additional Details</Title>
                    <p>This table takes any kind of vital metadata, that is not part of the mandatory scheme</p>
                    <Flex style={{marginBottom: '1rem'}}>
                        <Form form={detailForm} onFinish={onAddDetail} layout="inline">
                            <Form.Item name="detailKey" label="Detail Key" required>
                                <Input placeholder="unique key" type="text" />
                            </Form.Item>
                            <Form.Item name="detailValue" label="Detail Value" required>
                                <Input placeholder="value" type="text" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Add</Button>
                            </Form.Item>
                        </Form>
                    </Flex>
                    <Table 
                        columns={[
                            {title: 'Detail Key', key: 'detailKey', dataIndex: 'detailKey'},
                            {title: 'Detail Value', key: 'detailValue', dataIndex: 'detailValue'},
                            {title: 'action', key: 'action', dataIndex: 'action'}
                        ]}
                        dataSource={[
                            // add one line with colspan 3 at the end
                            ...details.map((d, i) => ({key: i, detailKey: d.detailKey, detailValue: d.detailValue, action: <Button type="text" icon={<DeleteFilled />} onClick={() => setDetails(details.filter(o => o.detailKey !== d.detailKey))} />})),

                        ]}
                    />
                </Collapse.Panel>
            </Collapse>

            <Collapse>
                <Collapse.Panel key="data_props" header="Dataset properties">
                    <DataPropertiesForm backendUrl={backendUrl} file={file} />
                </Collapse.Panel>
            </Collapse>
        </>
    );
};

export default UploadForm