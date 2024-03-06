import { createContext, useContext, useEffect, useState } from "react";
import { Author, Keyword, License, Variable } from "../Models";
import { useSettings } from "./SettingsContext";
import axios from "axios";

interface LookupData {
    authors: Author[];
    licenses: License[];
    variables: Variable[];
    keywords: Keyword[];
    invalidate: () => void;
}

const initialState: LookupData = {
    authors: [],
    licenses: [],
    variables: [],
    keywords: [],
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
    const [keywords, setKeywords] = useState<Keyword[]>([])

    const invalidate = () => {
        setDirty(true)
    }

    // whenever we are dirty, start loading the lookups again and start over
    useEffect(() => {
        // start loading keywords first
        const keywordPromise = axios.get<Keyword[]>(`${backendUrl}keywords`).then(response => setKeywords(response.data))

        // load authors
        const authorPromise = axios.get<Author[]>(`${backendUrl}authors`).then(response => setAuthors(response.data))

        // load licenses
        const licensePromise = axios.get<License[]>(`${backendUrl}licenses`).then(response => setLicenses(response.data))

        // load variables
        const variablePromise = axios.get<Variable[]>(`${backendUrl}variables`).then(response => setVariables(response.data))

        // finally wait for all promises and then set dirty to false again
        Promise.all([authorPromise, licensePromise, variablePromise, keywordPromise]).then(() => setDirty(false))
    }, [backendUrl, dirty])

    // build the return object
    const lookupData: LookupData = {
        authors,
        licenses,
        variables,
        keywords,
        invalidate
    }
    return (
        <LookupDataContext.Provider value={lookupData}>
            { children }
        </LookupDataContext.Provider>
    )
}

export const useLookups = () => useContext(LookupDataContext)