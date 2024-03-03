import { useEffect, useState } from "react"
import { Select, UploadFile } from "antd"


interface DataPropertiesFormProps {
    backendUrl: string,
    file?: UploadFile
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

    // 
    
    // update as the file changes
    useEffect(() => {
        if (DATA_SOURCE_TYPES.map(t => t.type).includes(file?.type || '')) {
            const type = DATA_SOURCE_TYPES.find(t => t.type === file?.type)
            setSourceType(type)
        } else {
            setSourceType(undefined)
        }
    }, [file])

    return (<>
        { JSON.stringify(sourceType) }
    </>)
}

export default DataPropertiesForm