import React, { createContext, useContext, useState } from 'react';

// Define the shape of the settings object
interface Settings {
    backendUrl: string;
    updateBackendUrl: (newUrl: string) => void;
}

// Create the initial settings object
const initialSettings: Settings = {
    backendUrl: 'http://127.0.0.1:8000/api/',
    updateBackendUrl: () => {}
};

// Create the SettingsContext
const SettingsContext = createContext(initialSettings)

// Create the SettingsProvider component
export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [backendUrl, setBackendUrl] = useState<string>(initialSettings.backendUrl);

    // Method to update the settings
    const updateBackendUrl = (newUrl: string) => {
        setBackendUrl(newUrl);
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