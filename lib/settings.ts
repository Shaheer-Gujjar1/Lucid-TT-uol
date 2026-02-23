'use client';

import { useState, useEffect } from 'react';

export interface AppSettings {
    enableGPA: boolean;
    enableEvents: boolean;
    enableOnlineIndicator: boolean;
    enableAuraAI: boolean;
    enableAppInfo: boolean;
}

const defaultSettings: AppSettings = {
    enableGPA: true,
    enableEvents: true,
    enableOnlineIndicator: true,
    enableAuraAI: true,
    enableAppInfo: true,
};

export function getSettings(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings;
    const stored = localStorage.getItem('lucid_settings');
    if (stored) {
        try {
            return { ...defaultSettings, ...JSON.parse(stored) };
        } catch (e) {
            return defaultSettings;
        }
    }
    return defaultSettings;
}

export function saveSettings(settings: AppSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lucid_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('lucid_settings_changed'));
}

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setSettings(getSettings());

        const handleSettingsChange = () => {
            setSettings(getSettings());
        };

        window.addEventListener('lucid_settings_changed', handleSettingsChange);
        return () => window.removeEventListener('lucid_settings_changed', handleSettingsChange);
    }, []);

    return { settings, saveSettings, mounted };
}
