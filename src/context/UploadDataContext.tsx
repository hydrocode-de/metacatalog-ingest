import { createContext, useContext, useEffect, useState } from "react";
import { Metadata } from "../Models";
import { set, cloneDeep } from "lodash"

interface InvalidationMessage {
    type: 'error' | 'warn';
    message: string;
}

interface UploadData {
    metadata: Partial<Metadata>;
    isValid: boolean;
    invalidMessages: InvalidationMessage[];
    resetMetadata: () => void;
    updateMetadata: (key: string, value: any) => void;
}

const initialUploadData: UploadData = {
    metadata: {},
    isValid: false,
    invalidMessages: [],
    resetMetadata: () => {},
    updateMetadata: () => {}
}

// create the Context itself
const UploadDataContext = createContext(initialUploadData);

// export the Context Provider
export const UploadDataProvider: React.FC<React.PropsWithChildren> = ({ children}) => {
    const [metadata, setMetadata] = useState<Partial<Metadata>>({});
    const [isValid, setIsValid] = useState<boolean>(false);
    const [invalidMessages, setInvalidMessages] = useState<InvalidationMessage[]>([]);

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
        invalidMessages,
        resetMetadata,
        updateMetadata
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

        // warnings - add a message but do not invalidate the form
        if (metadata.dataSource === undefined) {
            messages.push({type: 'warn', message: "No data source is specified. Are you sure you don't want to upload any data?."});
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