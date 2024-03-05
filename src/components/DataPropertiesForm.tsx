import { useEffect, useState } from "react"
import { Button, Col, Row, UploadFile, DatePicker, TimePicker, Input, InputNumber, Select } from "antd"
import { PlusOutlined, CloseOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import axios from "axios"

// get a Date range picker
const { RangePicker } = DatePicker
const { TextArea } = Input

interface DataPropertiesFormProps {
    backendUrl: string,
    file?: UploadFile
}

interface DataColumn {
    name: string,
    data_type: 'string' | 'number' | 'datetime'
}

interface DataSource {
    type: string,
    key: string,
    alias?: string
}
const DATA_SOURCE_TYPES: DataSource[] = [
    {key: 'csv', alias: 'CSV', type: 'text/csv'},
    {key: 'netcdf', alias: 'NetCDF', type: 'application/x-netcdf'}
] as const

const DataPropertiesForm: React.FC<DataPropertiesFormProps> = ({ backendUrl, file }) => {
    // source type
    const [sourceType, setSourceType] = useState<DataSource>()

    // state to store the scale information
    const [hasTemporal, setHasTemporal] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null)
    const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null)
    const [tempResolution, setTempResolution] = useState<dayjs.Dayjs | null>(null)
    const [hasSpatial, setHasSpatial] = useState<boolean>(false)
    const [extent, setExtent] = useState<string>()

    // get the data columns valid for this source
    const [availableColumns, setAvailableColumns] = useState<DataColumn[]>([])
    
    // update as the file changes
    useEffect(() => {
        // send the file to the backend to get the columns
        if (file) {
            // build the Form
            const formData = new FormData()
            formData.append('file', file.originFileObj!)
            axios.post<{num_rows: number, columns: DataColumn[]}>(`${backendUrl}data/preview`, formData, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(response => response.data).then(data => {
                setAvailableColumns(data.columns)
            })
        } else {
            setAvailableColumns([])
        }

        // set the source type
        if (DATA_SOURCE_TYPES.map(t => t.type).includes(file?.type || '')) {
            const type = DATA_SOURCE_TYPES.find(t => t.type === file?.type)
            setSourceType(type)
        } else {
            setSourceType(undefined)
        }
    }, [file])

    // empty data if scale is deleted
    useEffect(() => {
        if (!hasTemporal) {
            setStartDate(null)
            setEndDate(null)
            setTempResolution(null)
        }
    }, [hasTemporal])
    useEffect(() => {
        if (!hasSpatial) {
            setExtent(undefined)
        }
    }, [hasSpatial])

    if (!file) {
        return <>
            <i>Please upload the data first.</i>
        </>
    }

    return (<>
        { JSON.stringify(sourceType) }
        {/* Add the mapping of the columns */}

        { availableColumns.length > 0 ? (<>
            <div style={{marginTop: '1rem'}}>Data Columns (excluding axis information)</div>
            <Select 
                mode="tags"
                style={{width: '100%'}}
                placeholder="Select the data columns"
                options={availableColumns.map(c => ({label: `${c.name} [${c.data_type}]`, value: c.name}))}
            />
        </>) : (<>
            <p><i>Either no file uploaded or the preview did not respond any parseable column</i></p>
        </>) }

        <Row style={{marginTop: '1rem'}}>
            <Col span={12} style={{padding: '0 0.3rem'}}>
                { hasSpatial ? (<>
                    <Button type="dashed" style={{width: '100%'}} danger icon={<CloseOutlined />} onClick={() => setHasSpatial(false)}>Remove</Button>

                    <div style={{marginTop: '1rem'}}>Extent of the dataset:</div>
                    <TextArea style={{width: '100%'}} autoSize={{minRows: 4}} placeholder="use WKT: POINT(x y) or POLYGON ((x1 y1), (x2 y2) ...)" value={extent} onChange={e => setExtent(e.target.value)} />

                    <div style={{marginTop: '1rem'}}>Spatial resolution</div>
                    <InputNumber style={{width: '100%'}} placeholder="Resolution in Meter" min="0" step="1000" addonAfter="m" />
                </>) : (<>
                    <Button type="dashed" style={{width: '100%'}} icon={<PlusOutlined />} onClick={() => (setHasSpatial(true))}>Add spatial scale</Button>
                </>)}
            </Col>
            <Col span={12} style={{padding: '0 0.3rem'}}>
                { hasTemporal ? (<>
                    <Button type="dashed" style={{width: '100%'}} danger icon={<CloseOutlined />} onClick={() => setHasTemporal(false)}>Remove</Button>
                    
                    <div style={{marginTop: '1rem'}}>Datetime Column:</div>
                    <Select 
                        style={{width: '100%'}}
                        placeholder="Select the datetime column"
                        options={availableColumns.filter(c => c.data_type === 'datetime').map(c => ({label: `${c.name}`, value: c.name}))}
                    />
                    <div style={{marginTop: '1rem'}}>Temporal extent of the dataset:</div>
                    <RangePicker style={{width: '100%'}} maxDate={dayjs()} value={[startDate, endDate]} onChange={([start, end]) => {setStartDate(start); setEndDate(end)}}  />
                    
                    <div style={{marginTop: '1rem'}}>Temporal resolution</div>
                    <TimePicker style={{width: '100%'}} placeholder="Resolution" format="HH:mm" value={tempResolution} onChange={e => setTempResolution(e)} />
                </>) : (<>
                    <Button type="dashed" style={{width: '100%'}} icon={<PlusOutlined />} onClick={() => setHasTemporal(true)}>Add temporal scale</Button>
                </>)}
            </Col>
        </Row>
    </>)
}

export default DataPropertiesForm