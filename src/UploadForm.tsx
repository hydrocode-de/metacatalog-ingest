import {  Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';


const UploadForm = () => {
    return (
        <>
            <Dragger
                style={{maxHeight: '150px'}}
                accept=".csv,.nc"
                //multiple
                beforeUpload={() => false}
                onChange={info => console.log(info)}
            >
                <Button icon={<UploadOutlined />}>Select Files</Button>
            </Dragger>
            
        </>
    );
};

export default UploadForm