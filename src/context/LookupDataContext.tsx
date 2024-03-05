import { createContext, useContext, useEffect, useState } from "react";
import { Author, License, Variable } from "../Models";
import { useSettings } from "./SettingsContext";
import axios from "axios";

interface LookupData {
    authors: Author[];
    licenses: License[];
    variables: Variable[];
    invalidate: () => void;
}

const initialState: LookupData = {
    authors: [],
    licenses: [],
    variables: [],
    invalidate: () => {}
}

const LookupDataContext = createContext(initialState)


export const LookupDataProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    // load the backendUrl from the settings
    const { backendUrl } = useSettings()

    // create a state to invalidate the lookups
    const [dirty, setDirty] = useState<boolean>(false)

    // create the state to hold the actual lookup values
    const [authors, setAuthors] = useState<Author[]>([])
    const [licenses, setLicenses] = useState<License[]>([])
    const [variables, setVariables] = useState<Variable[]>([])

    const invalidate = () => {
        setDirty(true)
    }

    // whenever we are dirty, start loading the lookups again and start over
    useEffect(() => {
        // load authors
        const authorPromise = axios.get<Author[]>(`${backendUrl}authors`).then(response => setAuthors(response.data))

        // load licenses
        const licensePromise = axios.get<License[]>(`${backendUrl}licenses`).then(response => setLicenses(response.data))

        // load variables
        const variablePromise = axios.get<Variable[]>(`${backendUrl}variables`).then(response => setVariables(response.data))

        // finally wait for all promises and then set dirty to false again
        Promise.all([authorPromise, licensePromise, variablePromise]).then(() => setDirty(false))
    }, [backendUrl, dirty])

    // build the return object
    const lookupData: LookupData = {
        authors,
        licenses,
        variables,
        invalidate
    }
    return (
        <LookupDataContext.Provider value={lookupData}>
            { children }
        </LookupDataContext.Provider>
    )
}

export const useLookups = () => useContext(LookupDataContext)