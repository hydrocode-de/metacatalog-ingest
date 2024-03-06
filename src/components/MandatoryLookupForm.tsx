import { AutoComplete, Button, Select, Tree } from "antd";
import Title from "antd/es/typography/Title";
import { useLookups } from "../context/LookupDataContext";
import { useData } from "../context/UploadDataContext";
import { DeleteFilled } from "@ant-design/icons";
import { useState } from "react";

const MandatoryLookupForm: React.FC = () => {
    // load the lookup data
    const { licenses, variables, keywords } = useLookups()

    // get the context to update the metadata
    const { metadata, updateMetadata } = useData()

    // local state to manage the keyword options for autocomplete
    const [keywordOptions, setKeywordOptions] = useState<{label: string, value: string}[]>([])

    // implement logic to request keyword options
    const requestKeywordOptions = (name: string) => {
        // we have all keywords in the lookup data, so we can filter them on the client
        setKeywordOptions(
            keywords.filter(k => k.value.toLocaleLowerCase().includes(name.toLocaleLowerCase()))
            .map(k => ({label: k.path, value: k.uuid}))
        )
    }

    // handler to remove a keyword from the tree
    const removeKeyword = (uuid: string) => {
        // filter out the keyword
        updateMetadata('keywords', (metadata.keywords || []).filter(k => k.uuid !== uuid))
    }

    return (<>
        <Title level={5}>License</Title>
        <Select
            style={{width: '100%'}}
            placeholder="Select a license"
            value={metadata.license?.id || undefined}
            options={licenses.map(license => ({label: `${license.title}`, value: license.id}))}
            onChange={value => updateMetadata('license', licenses.find(license => license.id === value) || null)}
        />
        { metadata.license ? <p>{metadata.license.summary}</p> : null}
        
        <Title level={5}>Variable</Title>
        <Select
            style={{width: '100%'}}
            placeholder="Select a variable"
            value={metadata.variable?.id || undefined}
            options={variables.map(variable => ({label: `${variable.name} (${variable.unit.symbol})`, value: variable.id}))}
            onChange={value => updateMetadata('variable', variables.find(variable => variable.id === value) || null)}
        />
        {metadata.variable ? <p>{metadata.variable.name} ({metadata.variable.unit.name} - [{metadata.variable.unit.symbol}])</p> : null}
        
        <Title level={5}>Keywords</Title>
        <AutoComplete
            allowClear
            autoClearSearchValue
            options={keywordOptions}
            style={{width: '100%'}}
            onSearch={requestKeywordOptions}
            onSelect={value => updateMetadata('keywords', [...metadata.keywords || [], keywords.find(k => k.uuid === value)])}
            placeholder="Start typing to find keywords"
        />
        <Tree
            showIcon
            selectable={false}
            treeData={[
            ...(metadata.variable?.keyword ? [{key: metadata.variable.keyword.uuid, title: metadata.variable.keyword?.path}] : []),
                ...(metadata.keywords || []).map(key => (
                    {
                        title: key.path, 
                        key: key.uuid, 
                        value: key.path, 
                        icon: <DeleteFilled onClick={() => removeKeyword(key.uuid)} />
                    }
                ))
            ]}
        />
    </>)
}

export default MandatoryLookupForm;