'use client';

import { useState } from 'react';
import { useSettings, resetSettings, AUSTERE_CONFIG, HARMONIZED_CONFIG, OPULENT_CONFIG, AppSettings } from '@/lib/settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, saveSettings, mounted } = useSettings();
    const isClassic = settings?.wordingPreference === 'classic';
    const [secretTapCount, setSecretTapCount] = useState(0);

    if (!isOpen || !mounted) return null;

    const handleSecretTap = () => {
        setSecretTapCount((prev: number) => prev + 1);
    };

    const toggleSetting = (key: keyof AppSettings) => {
        const current = settings[key];
        if (typeof current !== 'boolean') return;

        const newValue = !current;
        let newSettings = { ...settings, [key]: newValue };

        // Notification strategy sync logic if events toggle is swapped
        if (key === 'enableEvents') {
            if (newValue === false) {
                if (settings.notificationStrategy === 'events_only') newSettings.notificationStrategy = 'none';
                else if (settings.notificationStrategy === 'all_classes_and_events') newSettings.notificationStrategy = 'all_classes';
                else if (settings.notificationStrategy === 'after_free_and_events') newSettings.notificationStrategy = 'after_free';
            } else {
                if (settings.notificationStrategy === 'none') newSettings.notificationStrategy = 'events_only';
                else if (settings.notificationStrategy === 'all_classes') newSettings.notificationStrategy = 'all_classes_and_events';
                else if (settings.notificationStrategy === 'after_free') newSettings.notificationStrategy = 'after_free_and_events';
            }
        }

        saveSettings(newSettings);
    };

    const isConfigMatch = (preset: AppSettings) => {
        const keys: (keyof AppSettings)[] = ['enableGPA', 'enableEvents', 'enableOnlineIndicator', 'enableAuraAI', 'enableAppInfo', 'enableCourseSearch', 'enableRoomMode', 'enableCrucible', 'enableWeekView', 'notificationStrategy', 'wordingPreference'];
        return keys.every(key => settings[key] === preset[key]);
    };

    const handleReset = () => {
        const msg = isClassic
            ? 'Are you sure you want to reset all settings? This will clear your preferences.'
            : 'Are you certain you wish to restore all configurations to their original state? This action cannot be undone.';
        if (confirm(msg)) {
            resetSettings();
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-fade-in pointer-events-auto">
            <div className="absolute inset-0 bg-slate-950/80 md:bg-slate-900/40 md:backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up transform transition-all flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-7 border-b border-slate-100/50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900 md:bg-gradient-to-r md:from-slate-50 md:to-white md:dark:from-slate-900 md:dark:to-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm border border-indigo-100/50 dark:border-indigo-500/20">
                            <i className="fas fa-sliders-h text-xl"></i>
                        </div>
                        <div onClick={handleSecretTap} className="cursor-pointer select-none">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">{isClassic ? 'Settings' : 'Preferences'}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{isClassic ? 'Configure your application' : 'Personalize your experience'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all duration-300"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">

                    {/* Quick Presets Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <i className="fas fa-bolt text-amber-500 text-[10px]"></i>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{isClassic ? 'Quick Presets' : 'Quick Config Protocols'}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => saveSettings({ ...settings, ...AUSTERE_CONFIG })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 transition-all duration-300 group ${isConfigMatch(AUSTERE_CONFIG) ? 'border-indigo-500 shadow-[0_8px_30px_rgba(79,70,229,0.15)] ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500/50'}`}
                            >
                                <i className={`fas fa-leaf ${isConfigMatch(AUSTERE_CONFIG) ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`}></i>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isConfigMatch(AUSTERE_CONFIG) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Austere</span>
                            </button>
                            <button
                                onClick={() => saveSettings({ ...settings, ...HARMONIZED_CONFIG })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 transition-all duration-300 group ${isConfigMatch(HARMONIZED_CONFIG) ? 'border-indigo-500 shadow-[0_8px_30px_rgba(79,70,229,0.15)] ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500/50'}`}
                            >
                                <i className={`fas fa-balance-scale ${isConfigMatch(HARMONIZED_CONFIG) ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`}></i>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isConfigMatch(HARMONIZED_CONFIG) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Harmonized</span>
                            </button>
                            <button
                                onClick={() => saveSettings({ ...settings, ...OPULENT_CONFIG })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 transition-all duration-300 group ${isConfigMatch(OPULENT_CONFIG) ? 'border-amber-500 shadow-[0_8px_30px_rgba(245,158,11,0.15)] ring-4 ring-amber-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-amber-500/50'}`}
                            >
                                <i className={`fas fa-gem ${isConfigMatch(OPULENT_CONFIG) ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}></i>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isConfigMatch(OPULENT_CONFIG) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>Opulent</span>
                            </button>
                        </div>
                    </section>

                    {/* Engine Modules Card */}
                    <SettingCard icon="fa-microchip" color="text-indigo-500" label={isClassic ? 'Core Modules' : 'Engine Protocols'}>
                        <div className="space-y-1">
                            <SettingToggle
                                icon="fa-calculator"
                                color="text-indigo-500"
                                title={isClassic ? 'GPA Calculator' : 'Academic GPA'}
                                desc={isClassic ? 'Enable grade tracking.' : 'Integrate GPA analytics.'}
                                checked={settings.enableGPA}
                                onToggle={() => toggleSetting('enableGPA')}
                                activeColor="bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                            />
                            <SettingToggle
                                icon="fa-calendar-alt"
                                color="text-amber-500"
                                title={isClassic ? 'Events' : 'Event Chronicle'}
                                desc={isClassic ? 'Enable event manager.' : 'Toggle management suite.'}
                                checked={settings.enableEvents}
                                onToggle={() => toggleSetting('enableEvents')}
                                activeColor="bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            />
                            <SettingToggle
                                icon="fa-door-open"
                                color="text-orange-500"
                                title={isClassic ? 'Room Mode' : 'Spatial Mode'}
                                desc={isClassic ? 'Enable occupancy search.' : 'Enable Room Timetable.'}
                                checked={settings.enableRoomMode}
                                onToggle={() => toggleSetting('enableRoomMode')}
                                activeColor="bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                            />
                            <SettingToggle
                                icon="fa-chair"
                                color="text-purple-500"
                                title={isClassic ? 'Exams & Seating' : 'Crucible Protocol'}
                                desc={isClassic ? 'Toggle exam plans.' : 'Toggle exam allocations.'}
                                checked={settings.enableCrucible}
                                onToggle={() => toggleSetting('enableCrucible')}
                                activeColor="bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                            />
                            {(secretTapCount >= 5 || settings.enableWeekView) && (
                                <SettingToggle
                                    icon="fa-calendar-week"
                                    color="text-blue-400"
                                    title={isClassic ? 'Week View' : 'Week View Chronicle'}
                                    desc={isClassic ? 'Toggle weekly schedule.' : 'Toggle weekly outlook.'}
                                    checked={settings.enableWeekView}
                                    onToggle={() => toggleSetting('enableWeekView')}
                                    activeColor="bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]"
                                />
                            )}
                        </div>
                    </SettingCard>

                    {/* Aura Intelligence Card */}
                    <SettingCard icon="fa-brain-circuit" color="text-fuchsia-500" label={isClassic ? 'Intelligence' : 'Aura Intelligence'}>
                        <div className="space-y-4 pt-1">
                            <SettingToggle
                                icon="fa-robot"
                                color="text-fuchsia-500"
                                title={isClassic ? 'AI Scheduler' : 'Aura AI Assist'}
                                desc={isClassic ? 'Enable AI assistance.' : 'Enable high-performance help.'}
                                checked={settings.enableAuraAI}
                                onToggle={() => toggleSetting('enableAuraAI')}
                                activeColor="bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                            />

                            <div className="px-2 space-y-2 pb-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-slate-800 dark:text-slate-200 tracking-tight italic text-xs uppercase">{isClassic ? 'Notifications' : 'Alerting Protocols'}</h4>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                </div>
                                <select
                                    value={settings.notificationStrategy}
                                    onChange={(e) => saveSettings({ ...settings, notificationStrategy: e.target.value as any })}
                                    className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-[10px] font-black rounded-xl px-4 py-3 border border-slate-200 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer w-full"
                                >
                                    {settings.enableEvents && (
                                        <>
                                            <option value="after_free_and_events">{isClassic ? 'CLASSES & EVENTS' : 'POST-RESUME & EVENTS'}</option>
                                            <option value="all_classes_and_events">{isClassic ? 'EVERYTHING' : 'COMPREHENSIVE & EVENTS'}</option>
                                            <option value="events_only">{isClassic ? 'EVENTS ONLY' : 'CHRONICLE EXCLUSIVE'}</option>
                                        </>
                                    )}
                                    <option value="after_free">{isClassic ? 'CLASSES ONLY' : 'POST-RESUME INTELLIGENCE'}</option>
                                    <option value="all_classes">{isClassic ? 'ALL CLASSES' : 'COMPREHENSIVE ALERTS'}</option>
                                    <option value="none">{isClassic ? 'OFF' : 'SILENT MODE'}</option>
                                </select>
                            </div>
                        </div>
                    </SettingCard>

                    {/* Interface Controls Card */}
                    <SettingCard icon="fa-wand-magic-sparkles" color="text-sky-500" label={isClassic ? 'Interface' : 'Experience Controls'}>
                        <div className="space-y-5 py-2">
                            <SettingSelect
                                label={isClassic ? 'Default Mode' : 'Global Persona'}
                                desc={isClassic ? 'Set primary view.' : 'Switch primary lens.'}
                                value={settings.defaultMode}
                                options={[
                                    { label: 'STUDENT', value: 'student' },
                                    { label: 'LECTURER', value: 'teacher' }
                                ]}
                                onChange={(v) => saveSettings({ ...settings, defaultMode: v as any })}
                            />

                            <SettingSelect
                                label={isClassic ? 'Filter Style' : 'Selector Protocol'}
                                desc={isClassic ? 'Choose filter appearance.' : 'dropdown vs button style.'}
                                value={settings.filterStyle || 'dropdown'}
                                options={[
                                    { label: 'DROPDOWNS', value: 'dropdown' },
                                    { label: 'BUTTONS', value: 'buttons' }
                                ]}
                                onChange={(v) => saveSettings({ ...settings, filterStyle: v as any })}
                            />

                            <SettingSelect
                                label={isClassic ? 'Vocabulary Tone' : 'Linguistic Tone'}
                                desc={isClassic ? 'Wording across site.' : 'Aura vs Standard tone.'}
                                value={settings.wordingPreference}
                                options={[
                                    { label: 'PREMIUM (Aura)', value: 'premium' },
                                    { label: 'CLASSIC (Standard)', value: 'classic' }
                                ]}
                                onChange={(v) => saveSettings({ ...settings, wordingPreference: v as any })}
                            />

                            <SettingToggle
                                icon="fa-search"
                                color="text-slate-400"
                                title={isClassic ? 'Course Search' : 'Course Discovery'}
                                desc={isClassic ? 'Enable subject searching.' : 'Enable advanced lookup.'}
                                checked={settings.enableCourseSearch}
                                onToggle={() => toggleSetting('enableCourseSearch')}
                                activeColor="bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                            />
                        </div>
                    </SettingCard>

                    {/* VisualsCard */}
                    <SettingCard icon="fa-database" color="text-emerald-500" label={isClassic ? 'Visuals & Meta' : 'Aesthetics & Data'}>
                        <div className="space-y-5 py-2">
                            <SettingSelect
                                label={isClassic ? 'Day View Export' : 'Chronicle Style'}
                                desc={isClassic ? 'Export image style.' : 'App Replica vs Document.'}
                                value={settings.exportDayStyle || 'fancy'}
                                options={[
                                    { label: 'FANCY (Replica)', value: 'fancy' },
                                    { label: 'NORMAL (Doc)', value: 'normal' }
                                ]}
                                onChange={(v) => saveSettings({ ...settings, exportDayStyle: v as any })}
                            />

                            <SettingToggle
                                icon="fa-wifi"
                                color="text-emerald-500"
                                title={isClassic ? 'Network Status' : 'Presence Indicator'}
                                desc={isClassic ? 'Show online status.' : 'Show active connectivity.'}
                                checked={settings.enableOnlineIndicator}
                                onToggle={() => toggleSetting('enableOnlineIndicator')}
                                activeColor="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            />

                            <SettingToggle
                                icon="fa-info-circle"
                                color="text-blue-500"
                                title={isClassic ? 'About App' : 'Knowledge Hub'}
                                desc={isClassic ? 'View help & info.' : 'Access app documentation.'}
                                checked={settings.enableAppInfo}
                                onToggle={() => toggleSetting('enableAppInfo')}
                                activeColor="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                            />
                        </div>
                    </SettingCard>

                    <div className="pt-2">
                        <button
                            onClick={handleReset}
                            className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border-2 border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 shadow-sm"
                        >
                            <i className="fas fa-undo-alt mr-2"></i> Factory Reset Protocol
                        </button>
                    </div>

                </div>

                <div className="p-5 flex justify-center border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-center leading-relaxed">
                        {isClassic ? 'Settings are saved on this device.' : 'Configurations are persisted locally.'}<br />
                        {isClassic ? 'Presets will overwrite current settings.' : 'Presets override current selections.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function SettingCard({ icon, color, label, children }: { icon: string, color: string, label: string, children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden animate-scale-in">
            <div className="px-5 py-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
                <i className={`fas ${icon} ${color} text-[10px]`}></i>
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{label}</h3>
            </div>
            <div className="p-3">
                {children}
            </div>
        </div>
    );
}

function SettingToggle({ icon, color, title, desc, checked, onToggle, activeColor }: { icon: string, color: string, title: string, desc: string, checked: boolean, onToggle: () => void, activeColor: string }) {
    return (
        <div
            onClick={onToggle}
            className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
            <div className="flex-1 pr-2">
                <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight text-xs">
                    <i className={`fas ${icon} ${color} w-4 text-[12px]`}></i> {title}
                </h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">{desc}</p>
            </div>
            <button
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-500 focus:outline-none shrink-0 ${checked ? activeColor : 'bg-slate-200 dark:bg-slate-700'}`}
            >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${checked ? 'translate-x-[1.35rem]' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

function SettingSelect({ label, desc, value, options, onChange }: { label: string, desc: string, value: string, options: { label: string, value: string }[], onChange: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between px-3">
            <div className="flex-1 pr-2">
                <h4 className="font-black text-slate-800 dark:text-slate-200 tracking-tight italic text-xs uppercase">{label}</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">{desc}</p>
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-[9px] font-black rounded-xl px-3 py-2 border border-slate-200 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer min-w-[100px]"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
