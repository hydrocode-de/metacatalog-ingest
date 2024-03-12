import { ControlOutlined } from "@ant-design/icons"
import { FloatButton } from "antd"
import { useData } from "../context/UploadDataContext"

const DebugButton: React.FC = () => {
    // subscribe to metadata
    const { metadata } = useData()
    return <>
        <FloatButton 
            type="default"
            icon={<ControlOutlined />}
            onClick={() => console.log(metadata)}
        />
    </>
}

export default DebugButton