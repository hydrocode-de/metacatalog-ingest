import React, { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem } from "localforage"

// Define the shape of the settings object
interface Settings {
    backendUrl: string;
    updateBackendUrl: (newUrl: string) => void;
}

// Create the initial settings object
const initialSettings: Settings = {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/api/',
    updateBackendUrl: () => {}
};

// Create the SettingsContext
const SettingsContext = createContext(initialSettings)

// Create the SettingsProvider component
export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [backendUrl, setBackendUrl] = useState<string>(initialSettings.backendUrl);

    // Load the settings from local storage
    useEffect(() => {
        getItem<Partial<Settings>>('settings').then(settings => {
            if (settings?.backendUrl) {
                setBackendUrl(settings.backendUrl)
            }
        })
    }, [])

    // Method to update the settings
    const updateBackendUrl = (newUrl: string) => {
        setBackendUrl(newUrl);
        setItem('settings', { backendUrl: newUrl })
    }

    // build the context value
    const settings: Settings ={
        backendUrl,
        updateBackendUrl
    }

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom hook for accessing the settings
export const useSettings = () => useContext(SettingsContext);