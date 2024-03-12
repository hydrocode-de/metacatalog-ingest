import { createContext, useContext, useEffect, useState } from "react";
import { Metadata } from "../Models";
import { set, cloneDeep } from "lodash"
import { UploadFile } from "antd";
import axios from "axios";
import { useSettings } from "./SettingsContext";

interface InvalidationMessage {
    type: 'error' | 'warn';
    message: string;
}

interface UploadData {
    metadata: Partial<Metadata>;
    isValid: boolean;
    invalidMessages: InvalidationMessage[];
    uploadFile?: UploadFile;
    resetMetadata: () => void;
    updateMetadata: (key: string, value: any) => void;
    newUploadFile: (file: UploadFile) => void;
    removeUploadFile: () => void;
    upload: () => Promise<{status: 'success' | 'fail', message: string}>;
}

const initialUploadData: UploadData = {
    metadata: {},
    isValid: false,
    invalidMessages: [],
    resetMetadata: () => {},
    updateMetadata: () => {},
    newUploadFile: () => {},
    removeUploadFile: () => {},
    upload: () => Promise.resolve({status: 'fail', message: 'Implementation error'})
}

// create the Context itself
const UploadDataContext = createContext(initialUploadData);

// export the Context Provider
export const UploadDataProvider: React.FC<React.PropsWithChildren> = ({ children}) => {
    // use the backendUrl from the settings
    const { backendUrl } = useSettings()

    // context state
    const [metadata, setMetadata] = useState<Partial<Metadata>>({});
    const [isValid, setIsValid] = useState<boolean>(false);
    const [invalidMessages, setInvalidMessages] = useState<InvalidationMessage[]>([]);
    const [uploadFile, setUploadFile] = useState<UploadFile>();

    const resetMetadata = () => {
        setMetadata({});
    }

    const updateMetadata = (key: string, value: any) => {
        // create a copy of the current metadata
        const currentMetadata = cloneDeep(metadata);

        // update the copy
        set(currentMetadata, key, value);

        // update the state to the new metadata
        setMetadata(currentMetadata);
    }

    // file handling
    const newUploadFile = (file: UploadFile) => {
        // set the file
        setUploadFile(file)

        // create a new datasource
        // TODO: here we need to handle different datasource later
        // TODO: how should the table actually be called?
        updateMetadata('dataSource', {type: 'internal', path: file.name})

    }
    const removeUploadFile = () => {
        // remove the file object
        setUploadFile(undefined)

        // remove the datasource
        updateMetadata('dataSource', undefined)
    }

    const upload = (): Promise<{status: 'success' | 'fail', message: string}> => {
        if (!isValid) {
            console.log("Cannot upload, metdata is not valid")
            console.log(metadata)
            return Promise.resolve({status: 'fail', message: 'Metadata is not valid'})
        }

        // the temporal information needs to be transformed
        

        
        // build the form data
        const form = new FormData()

        // add the form fields
        form.append('file', uploadFile?.originFileObj!)
        form.append('metadata', JSON.stringify(metadata))
        
        // make the request and return the Promise for results
        return axios.post<{status: 'success' | 'fail', message: string}>(
            `${backendUrl}upload`,
            form, 
            {headers: {'Content-Type': 'multipart/form-data', 'Accept': 'application/json'}}
        ).then(res => res.data)

    }


    // create the context value to be passed to the Provider
    const uploadData: UploadData = {
        metadata,
        isValid,
        invalidMessages,
        uploadFile,
        resetMetadata,
        updateMetadata,
        newUploadFile,
        removeUploadFile,
        upload
    }

    // use Effect to update the isValid state whenever metadata changes
    useEffect(() => {
        // create temporary variables to set the validity and the messages
        let valid = true;
        const messages: InvalidationMessage[] = [];

        // check for title
        if (metadata.title === undefined || metadata.title.length === 0) {
            valid = false;
            messages.push({type: 'error', message: 'A title is required'});
        }

        // check for abstract
        if (metadata.abstract === undefined || metadata.abstract.length === 0) {
            valid = false;
            messages.push({type: 'error', message: 'An abstract is required'});
        }

        // check for first author
        if (metadata.firstAuthor === undefined || metadata.firstAuthor === null) {
            valid = false;
            messages.push({type: 'error', message: 'A first author is required. If you cannot find the author, please add them first.'});
        }

        // check for license
        if (metadata.license === undefined || metadata.license === null) {
            valid = false;
            messages.push({type: 'error', message: 'No license is specified. Please choose one. If None fits your needs, please contact the administrator'});
        }

        // variable has to be set
        if (metadata.variable === undefined || metadata.variable === null) {
            valid = false;
            messages.push({type: 'error', message: 'No variable is specified. Every datasets needs to define variable. Please choose one. If you cannot find the variable, please contact the administrator'});
        }

        // dataSource validation
        if (metadata.dataSource === undefined) {
            messages.push({type: 'warn', message: "No data source is specified. Are you sure you don't want to upload any data?."});
        } else {
            // make sure that the dataSource is valid
            if (!metadata.dataSource.spatial_scale && !metadata.dataSource.temporal_scale) {
                messages.push({type: 'warn', message: 'The datasource has neither  a spatial nor a temporal scale. That is most likely a mistake.'});
            }
            if (!metadata.dataSource.variable_names || metadata.dataSource.variable_names.length === 0) {
                messages.push({type: 'warn', message: 'The datasource does not reference the variable column(s). This might be a mistake.'});
            }

            // make sure there are spatial dimension names
            if (metadata.dataSource.spatial_scale && (!metadata.dataSource.spatial_scale.dimension_names || metadata.dataSource.spatial_scale.dimension_names.length === 0)) {
                messages.push({type: 'warn', message: 'The spatial scale has no dimension names. If your data has a spatial index, please provide the column names.'});
            }
            if (metadata.dataSource.spatial_scale && metadata.dataSource.spatial_scale.dimension_names && metadata.dataSource.spatial_scale.dimension_names.length !== 2) {
                messages.push({type: 'warn', message: 'The spatial scale has not exactly 2 dimension names (x, y). This may be a mistake.'});
            }

            // spatial extent
            if (metadata.dataSource.spatial_scale && !metadata.dataSource.spatial_scale.extent) {
                valid = false;
                messages.push({type: 'error', message: 'The spatial scale has no extent. Please provide a WKT.'});
            }
            // spatial resolution
            if (metadata.dataSource.spatial_scale && !metadata.dataSource.spatial_scale.resolution) {
                valid = false;
                messages.push({type: 'error', message: 'The spatial scale has no resolution. Please set the resolution in meter.'});
            }

            // make sure there are temporal dimension names
            if (metadata.dataSource.temporal_scale && (!metadata.dataSource.temporal_scale.dimension_names || metadata.dataSource.temporal_scale.dimension_names.length === 0)) {
                messages.push({type: 'warn', message: 'The temporal scale has no dimension names. If your data has a temporal index, please provide the column names.'});
            }
            if (metadata.dataSource.temporal_scale && metadata.dataSource.temporal_scale.dimension_names && metadata.dataSource.temporal_scale.dimension_names.length !== 1) {
                messages.push({type: 'warn', message: 'The temporal scale has not exactly 1 dimension name. This is most likely a mistake.'});
            }

            // temporal extent
            if (metadata.dataSource.temporal_scale && !(metadata.dataSource.temporal_scale.observation_start && metadata.dataSource.temporal_scale.observation_end)) {
                valid = false;
                messages.push({type: 'error', message: 'The temporal scale has no extent. Please provide the start and end date.'});
            }

            // temporal resolution
            if (metadata.dataSource.temporal_scale && !metadata.dataSource.temporal_scale.resolution) {
                valid = false;
                messages.push({type: 'error', message: 'The temporal scale has no resolution. Please set the resolution in the format "HH:mm".'});
            }
        }

        setIsValid(valid);
        setInvalidMessages(messages);
    }, [metadata])

    return (
        <UploadDataContext.Provider value={uploadData}>
            { children }
        </UploadDataContext.Provider>
    )
}

export const useData = () => useContext(UploadDataContext)