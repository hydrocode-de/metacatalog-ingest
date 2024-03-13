import { Button, Flex, Form, Input, Table } from "antd"
import Title from "antd/es/typography/Title"
import { useData } from "../context/UploadDataContext"
import { DeleteFilled } from "@ant-design/icons"

const DetailsForm: React.FC = () => {
    // load the metadata from the current context
    const { metadata, updateMetadata } = useData()
    // details
    //const [details, setDetails] = useState<{detailKey: string, detailValue: string}[]>([])
    const [ detailForm ] = Form.useForm()

    const onAddDetail = (newDetail: {detailKey: string, detailValue: string}) => {
        updateMetadata('details', [
            ...(metadata.details || []),
            {name: newDetail.detailKey, value: newDetail.detailValue, type: 'string'}
        ])
        detailForm.resetFields()
    }

    const onRemoveDetail = (name: string) => {
        updateMetadata('details', (metadata.details || []).filter(d => d.name !== name))
    }

    return (<>
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
                ...(metadata.details || []).map((d, i) => ({
                        key: i, 
                        detailKey: d.name, 
                        detailValue: d.value, 
                        action: <Button type="text" icon={<DeleteFilled />} onClick={() => onRemoveDetail(d.name)} />
                    }
                )),

            ]}
        />
    </>)
}

export default DetailsForm