import {  useState } from 'react';
import {   Badge, Button, Checkbox, Collapse, Input,  UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import Title from 'antd/es/typography/Title';

import { useSettings } from '../context/SettingsContext'
import DataPropertiesForm from './DataPropertiesForm';
import { useData } from '../context/UploadDataContext';
import AuthorSelectForm from './AuthorSelectForm';
import MandatoryLookupForm from './MandatoryLookupForm';
import ValidationResult from './ValidationResult';
import DetailsForm from './DetailsForm';

const { TextArea } = Input;


const UploadForm: React.FC = () => {
    // get the current backend url
    const { backendUrl } = useSettings()
    const { metadata, invalidMessages, updateMetadata} = useData()

    // uploaded files
    const [file, setFile] = useState<UploadFile>()

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

                    <DetailsForm />
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