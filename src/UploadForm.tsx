import { useEffect, useState } from 'react';
import {  AutoComplete, Button, Checkbox, Collapse, Flex, FloatButton, Form, Input, Select, Table, Tree, UploadFile } from 'antd';
import { UploadOutlined, DeleteFilled } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import Title from 'antd/es/typography/Title';

import { useSettings } from './context/SettingsContext'
import { Keyword, License, Variable, Author } from './Models'
import AddAuthorForm from './components/AddAuthorForm';
import DataPropertiesForm from './components/DataPropertiesForm';
import { useData } from './context/UploadDataContext';

const { TextArea } = Input;


const UploadForm: React.FC = () => {
    // get the current backend url
    const { backendUrl } = useSettings()
    const { metadata, isValid, updateMetadata} = useData()

    // mark the lookup data as dirty
    const [dirty, setDirty] = useState<boolean>(false)

    // uploaded files
    const [file, setFile] = useState<UploadFile>()

    // other information
    const [title, setTitle] = useState<string>(metadata.title || '')
    const [titleExists, setTitleExists] = useState<boolean>(false)

    // lookup values
    const [licenses, setLicenses] = useState<License[]>([])
    const [license, setLicense] = useState<License | null>(null)
    const [variables, setVariables] = useState<Variable[]>([])
    const [variable, setVariable] = useState<Variable | null>(null)
    const [authors, setAuthors] = useState<Author[]>([])
    const [firstAuthor, setFirstAuthor] = useState<Author | null>(null)
    const [coAuthors, setCoAuthors] = useState<Author[]>([])

    // keyword management
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [keywordOptions, setKeywordOptions] = useState<{label: string, value: string}[]>([])

    // details
    const [details, setDetails] = useState<{detailKey: string, detailValue: string}[]>([])
    const [ detailForm ] = Form.useForm()

    const requestKeywordOptions = (name: string) => {
        //if (name.length < 3) setKeywordOptions([])
        fetch(`${backendUrl}keywords?name=${name}`).then(response => response.json()).then((data: Keyword[]) => {
            setKeywordOptions(data.map(k => ({label: k.path, value: k.uuid})))
        })
    }
    
    const onAddKeyword = (uuid: string) => {
        // fetch that keyword from the database and pass it
        fetch(`${backendUrl}keyword/${uuid}`).then(response => response.json()).then((data: Keyword) => {
            setKeywords([...keywords, data])
            detailForm.resetFields()
        })
    }

    const onAddDetail = (newDetail: {detailKey: string, detailValue: string}) => {
        setDetails([...details, newDetail])
    }
    
    // fetch the lookup data
    useEffect(() => {
        // fetch the licenses
        fetch(`${backendUrl}licenses`).then(response => response.json()).then(data => setLicenses(data))

        // fetch the variables
        fetch(`${backendUrl}variables`).then(response => response.json()).then(data => setVariables(data))

        // fetch the authors
        fetch(`${backendUrl}authors`).then(response => response.json()).then(data => setAuthors(data))

        // finally set dirty to false again
        setDirty(false)
    }, [backendUrl, dirty])

    // effect to check if the title already exists
    useEffect(() => {
        fetch(`${backendUrl}datasets/exists?title=${title}`).then(response => response.json()).then(exists => setTitleExists(exists))
    })

    // some helper functions to format some stuff
    const authorLabel = (author: Author): string => {
        if (author.is_organisation) {
            return `${author.organisation_name} (${author.organisation_abbrev})`
        } else {
            return `${author.first_name} ${author.last_name}`
        }
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

            <Title level={2}>{metadata.title || 'Metadata'}</Title>

            <Collapse>
                <Collapse.Panel key="main_info" header="General Information">
                    {/* <Input addonBefore="Title" placeholder="Unique descriptive Dataset title" value={title} onChange={e => setTitle(e.target.value)} status={titleExists ? 'error' : ''} /> */}
                    <Input addonBefore="Title" placeholder="Unique descriptive Dataset title" value={metadata.title} onChange={e => updateMetadata('title', e.target.value)} status={titleExists ? 'error' : ''} />
                    <TextArea placeholder="Abstract" autoSize={{minRows: 5, maxRows: 10}} value={metadata.abstract} onChange={e => updateMetadata('abstract', e.target.value)} />
                    <Collapse>
                        <Collapse.Panel key="external_id" header="Optional Attributes">
                            <Input placeholder="optional ID by external data provider" addonBefore="External ID" />
                            <Checkbox>Embargo dataset for 2 years (NOT RECOMMENDED)</Checkbox>
                        </Collapse.Panel>
                    </Collapse>

                    <Title level={4}>Authors</Title>
                    <Flex style={{width: '100%', alignItems: 'center'}}>
                        <div style={{marginRight: '1rem'}}>First Author</div>
                        <Select
                            style={{flexGrow: 1}}
                            value={firstAuthor?.uuid}
                            placeholder="Select the first author"
                            options={authors.map(author => ({label: authorLabel(author), value: author.uuid}))}
                            onChange={value => setFirstAuthor(authors.find(author => author.uuid === value) || null)}
                        />
                        <AddAuthorForm backendUrl={backendUrl} onSuccess={() =>  setDirty(true)} />
                    </Flex>
                    <Flex style={{width: '100%', alignItems: 'center'}}>
                        <div style={{marginRight: '1rem'}}>Co-Authors</div>
                        <Select
                            mode="multiple"
                            style={{flexGrow: 1}}
                            value={coAuthors.map(a => a.uuid)}
                            placeholder="Add all co-authors in order if any"
                            options={authors.filter(a => !firstAuthor || (firstAuthor && firstAuthor.id !== a.id)).map(a => ({label: authorLabel(a), value: a.uuid}))}
                            onChange={(values) => setCoAuthors(authors.filter(a => values.includes(a.uuid)))}
                        />
                    </Flex>
                </Collapse.Panel>
            </Collapse>

            <Collapse>
                <Collapse.Panel key="metadata" header="Dataset Metadata">
                    <Title level={5}>License</Title>
                    <Select
                        style={{width: '100%'}}
                        placeholder="Select a license"
                        options={licenses.map(license => ({label: `${license.title}`, value: license.id}))}
                        onChange={value => setLicense(licenses.find(license => license.id === value) || null)}
                    />
                    { license ? <p>{license.summary}</p> : null}
                    
                    <Title level={5}>Variable</Title>
                    <Select
                        style={{width: '100%'}}
                        placeholder="Select a variable"
                        options={variables.map(variable => ({label: `${variable.name} (${variable.unit.symbol})`, value: variable.id}))}
                        onChange={value => setVariable(variables.find(variable => variable.id === value) || null)}
                    />
                    {variable ? <p>{variable.name} ({variable.unit.name} - [{variable.unit.symbol}])</p> : null}
                    
                    <Title level={5}>Keywords</Title>
                    <AutoComplete
                        allowClear
                        autoClearSearchValue
                        options={keywordOptions}
                        style={{width: '100%'}}
                        onSearch={requestKeywordOptions}
                        onSelect={onAddKeyword}
                        placeholder="Start typing to find keywords"
                    />
                    <Tree
                        showIcon
                        treeData={[
                        ...(variable?.keyword ? [{key: variable.keyword.uuid, title: variable.keyword?.path}] : []),
                            ...keywords.map(key => ({title: key.path, key: key.uuid, value: key.path, icon: <DeleteFilled />}))
                        ]}
                        onSelect={selected => setKeywords(keywords.filter(k => !selected.includes(k.uuid)))}
                    />

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
            
            <FloatButton type={isValid ? 'primary' : 'default'} icon={<UploadOutlined />} onClick={() => isValid ? console.log(metadata) : console.log('Data not valid')} />
        </>
    );
};

export default UploadForm