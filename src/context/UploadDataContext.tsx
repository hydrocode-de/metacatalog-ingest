import { createContext, useContext, useEffect, useState } from "react";
import { Metadata } from "../Models";
import { set, cloneDeep } from "lodash"

interface UploadData {
    metadata: Partial<Metadata>;
    isValid: boolean;
    resetMetadata: () => void;
    updateMetadata: (key: string, value: any) => void;
}

const initialUploadData: UploadData = {
    metadata: {},
    isValid: false,
    resetMetadata: () => {},
    updateMetadata: () => {}
}

// create the Context itself
const UploadDataContext = createContext(initialUploadData);

// export the Context Provider
export const UploadDataProvider: React.FC<React.PropsWithChildren> = ({ children}) => {
    const [metadata, setMetadata] = useState<Partial<Metadata>>({});
    const [isValid, setIsValid] = useState<boolean>(false);

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

    // create the context value to be passed to the Provider
    const uploadData: UploadData = {
        metadata,
        isValid,
        resetMetadata,
        updateMetadata
    }

    // use Effect to update the isValid state whenever metadata changes
    useEffect(() => {
        const valid = Object.keys(metadata).length > 0
            && metadata.title !== undefined && metadata.title.length > 0
            && metadata.abstract !== undefined && metadata.abstract.length > 0
            //&& metadata.firstAuthor !== undefined && metadata.firstAuthor !== null

        setIsValid(valid);
    }, [metadata])

    return (
        <UploadDataContext.Provider value={uploadData}>
            { children }
        </UploadDataContext.Provider>
    )
}

export const useData = () => useContext(UploadDataContext)