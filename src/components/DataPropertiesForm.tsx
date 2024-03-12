import { useEffect, useState } from "react"
import { Button, Col, Row, DatePicker, TimePicker, Input, InputNumber, Select } from "antd"
import { PlusOutlined, CloseOutlined } from "@ant-design/icons"
import dayjs, { Dayjs } from "dayjs"
import axios from "axios"
import { useData } from "../context/UploadDataContext"
import { useSettings } from "../context/SettingsContext"

// get a Date range picker
const { RangePicker } = DatePicker
const { TextArea } = Input


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

const DataPropertiesForm: React.FC = () => {
    // get the backend url from the settings
    const { backendUrl } = useSettings()

    // load the data context to listen to file changes
    const { metadata, updateMetadata, uploadFile } = useData()

    // source type
    const [sourceType, setSourceType] = useState<DataSource>()

    // get the data columns valid for this source
    const [availableColumns, setAvailableColumns] = useState<DataColumn[]>([])
    
    // update as the file changes
    useEffect(() => {
        // send the file to the backend to get the columns
        if (uploadFile) {
            // build the Form
            const formData = new FormData()
            formData.append('file', uploadFile.originFileObj!)
            axios.post<{num_rows: number, columns: DataColumn[]}>(`${backendUrl}data/preview`, formData, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(response => response.data).then(data => {
                setAvailableColumns(data.columns)
            })

            // add the dataSource objcet
            //updateMetadata('dataSource', {type: 'internal', path: uploadFile.fileName})
        } else {
            // remove the available columns
            setAvailableColumns([])

            // reset the dataSource
            //updateMetadata('dataSource', undefined)
        }

        // set the source type
        if (DATA_SOURCE_TYPES.map(t => t.type).includes(uploadFile?.type || '')) {
            const type = DATA_SOURCE_TYPES.find(t => t.type === uploadFile?.type)
            setSourceType(type)
        } else {
            setSourceType(undefined)
        }
    }, [uploadFile])

    if (!uploadFile) {
        return <>
            <i>Please upload the data first.</i>
        </>
    }

    return (<>
        { availableColumns.length > 0 ? (<>
            <div style={{marginTop: '1rem'}}>Data Columns (excluding axis information)</div>
            <Select 
                mode="tags"
                style={{width: '100%'}}
                placeholder="Select the data columns"
                value={metadata.dataSource?.variable_names || []}
                options={availableColumns.map(c => ({label: `${c.name} [${c.data_type}]`, value: c.name}))}
                onChange={v => updateMetadata('dataSource.variable_names', v)}
            />
        </>) : (<>
            <p><i>Either no file uploaded or the preview did not respond any parseable column</i></p>
        </>) }

        <Row style={{marginTop: '1rem'}}>
            <Col span={12} style={{padding: '0 0.3rem'}}>
                { !!metadata.dataSource?.spatial_scale ? (<>
                    <Button type="dashed" style={{width: '100%'}} danger icon={<CloseOutlined />} onClick={() => updateMetadata('dataSource.spatial_scale', undefined)}>Remove</Button>

                    <div style={{marginTop: '1rem'}}>Spatial Columns:</div>
                    <Select 
                        mode="tags"
                        style={{width: '100%'}}
                        placeholder="Select the spatial columns"
                        value={metadata.dataSource.spatial_scale.dimension_names || []}
                        options={availableColumns.filter(c => c.data_type === 'number').map(c => ({label: `${c.name}`, value: c.name}))}
                        onChange={v => updateMetadata('dataSource.spatial_scale.dimension_names', v)}
                    />

                    <div style={{marginTop: '1rem'}}>Extent of the dataset:</div>
                    <TextArea 
                        style={{width: '100%'}}
                        autoSize={{minRows: 4}}
                        placeholder="use WKT: POINT(x y) or POLYGON ((x1 y1), (x2 y2) ...)"
                        value={metadata.dataSource.spatial_scale.extent || ''} 
                        onChange={e => updateMetadata('dataSource.spatial_scale.extent', e.target.value)}
                    />

                    <div style={{marginTop: '1rem'}}>Spatial resolution</div>
                    <InputNumber 
                        style={{width: '100%'}}
                        placeholder="Resolution in Meter"
                        min={0}
                        step={1000}
                        addonAfter="m" 
                        value={metadata.dataSource.spatial_scale.resolution || undefined}
                        onChange={res => updateMetadata('dataSource.spatial_scale.resolution', res)}
                    />
                </>) : (<>
                    <Button type="dashed" style={{width: '100%'}} icon={<PlusOutlined />} onClick={() => updateMetadata('dataSource.spatial_scale', {})}>Add spatial scale</Button>
                </>)}
            </Col>
            <Col span={12} style={{padding: '0 0.3rem'}}>
                { !!metadata.dataSource?.temporal_scale ? (<>
                    <Button type="dashed" style={{width: '100%'}} danger icon={<CloseOutlined />} onClick={() => updateMetadata('dataSource.temporal_scale', undefined)}>Remove</Button>
                    
                    <div style={{marginTop: '1rem'}}>Datetime Column:</div>
                    <Select
                        mode="tags"
                        style={{width: '100%'}}
                        placeholder="Select the datetime column"
                        value={metadata.dataSource.temporal_scale.dimension_names || []}
                        options={availableColumns.filter(c => c.data_type === 'datetime').map(c => ({label: `${c.name}`, value: c.name}))}
                        onChange={v => updateMetadata('dataSource.temporal_scale.dimension_names', v)}
                    />
                    <div style={{marginTop: '1rem'}}>Temporal extent of the dataset:</div>
                    <RangePicker 
                        style={{width: '100%'}} 
                        maxDate={dayjs()} 
                        value={[
                            metadata.dataSource?.temporal_scale?.observation_start, 
                            metadata.dataSource?.temporal_scale?.observation_end
                        ]} 
                        //onChange={ext => updateMetadata('dataSource.temporal_scale.extent', ext)}  
                        
                        onChange={([start, end]) => {
                            //console.log([start, end])
                            updateMetadata('dataSource.temporal_scale.observation_start', start)
                            updateMetadata('dataSource.temporal_scale.observation_end', end)
                        }}
                    />
                    
                    <div style={{marginTop: '1rem'}}>Temporal resolution</div>
                    
                    <TimePicker 
                        style={{width: '100%'}}
                        placeholder="Resolution"
                        format="HH:mm" 
                        value={metadata.dataSource.temporal_scale.resolution || undefined} 
                        onChange={e => {
                            console.log(e.toLocaleString())
                            updateMetadata('dataSource.temporal_scale.resolution', e)
                        }}
                    />
                </>) : (<>
                    <Button type="dashed" style={{width: '100%'}} icon={<PlusOutlined />} onClick={() => updateMetadata('dataSource.temporal_scale', {})}>Add temporal scale</Button>
                </>)}
            </Col>
        </Row>
    </>)
}

export default DataPropertiesForm