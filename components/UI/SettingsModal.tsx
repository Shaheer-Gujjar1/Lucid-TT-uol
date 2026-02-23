'use client';

import { useSettings } from '@/lib/settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, saveSettings, mounted } = useSettings();

    if (!isOpen || !mounted) return null;

    const toggleSetting = (key: keyof typeof settings) => {
        saveSettings({
            ...settings,
            [key]: !settings[key]
        });
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-fade-in pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up transform transition-all flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-inner">
                            <i className="fas fa-cog text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Toggles */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-calculator text-indigo-500 w-4"></i> GPA Calculator
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Show GPA utility in the Navigation Bar.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableGPA')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableGPA ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableGPA ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-calendar-alt text-amber-500 w-4"></i> Events Page
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Show Events tracking in the Navigation Bar.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableEvents')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableEvents ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableEvents ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-wifi text-emerald-500 w-4"></i> Online Indicator
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Display network status in the floating action menu.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableOnlineIndicator')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableOnlineIndicator ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableOnlineIndicator ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-robot text-fuchsia-500 w-4"></i> Aura AI Assistant
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable the global AI Assistant features.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableAuraAI')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableAuraAI ? 'bg-fuchsia-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAuraAI ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-info-circle text-blue-500 w-4"></i> App Info Button
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Show the information button in the floating menu.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableAppInfo')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableAppInfo ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAppInfo ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
