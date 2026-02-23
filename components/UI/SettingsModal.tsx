'use client';

import { useSettings, resetSettings } from '@/lib/settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, saveSettings, mounted } = useSettings();

    if (!isOpen || !mounted) return null;

    const toggleSetting = (key: keyof typeof settings) => {
        const newValue = !settings[key];
        let newSettings = { ...settings, [key]: newValue };

        // Bug Fix & Strategy Alignment Logic
        if (key === 'enableEvents' && newValue === false) {
            // If turning OFF events, shift to a non-event dependent strategy
            if (settings.notificationStrategy === 'events_only') {
                newSettings.notificationStrategy = 'none';
            } else if (settings.notificationStrategy === 'all_classes_and_events') {
                newSettings.notificationStrategy = 'all_classes';
            } else if (settings.notificationStrategy === 'after_free_and_events') {
                newSettings.notificationStrategy = 'after_free';
            }
        }

        saveSettings(newSettings);
    };

    const handleReset = () => {
        if (confirm('Are you certain you wish to restore all configurations to their original state? This action cannot be undone.')) {
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
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">Preferences</h3>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Personalize your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all duration-300"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Quick Settings Presets */}
                <div className="p-6 pb-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-800/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Quick Config Protocols</p>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: false, enableEvents: false, enableOnlineIndicator: false, enableAuraAI: false, enableAppInfo: false,
                                enableCourseSearch: false, enableRoomMode: false, enableCrucible: false, enableWeekView: false,
                                notificationStrategy: 'none'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group"
                        >
                            <i className="fas fa-leaf text-slate-400 group-hover:text-indigo-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Austere</span>
                        </button>
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: true, enableOnlineIndicator: true, enableAppInfo: true, enableCourseSearch: true, enableRoomMode: true,
                                enableCrucible: true, enableWeekView: true,
                                enableEvents: false, enableAuraAI: false,
                                notificationStrategy: 'after_free'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-[0_8px_30px_rgba(79,70,229,0.15)] group"
                        >
                            <i className="fas fa-balance-scale text-indigo-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Harmonized</span>
                        </button>
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: true, enableEvents: true, enableOnlineIndicator: true, enableAuraAI: true, enableAppInfo: true,
                                enableCourseSearch: true, enableRoomMode: true, enableCrucible: true, enableWeekView: true,
                                notificationStrategy: 'after_free_and_events'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-amber-500 transition-all group"
                        >
                            <i className="fas fa-gem text-slate-400 group-hover:text-amber-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Opulent</span>
                        </button>
                    </div>
                </div>

                {/* Quick Settings Presets */}
                <div className="p-6 pb-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-800/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Quick Config Protocols</p>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: false, enableEvents: false, enableOnlineIndicator: false, enableAuraAI: false, enableAppInfo: false,
                                enableCourseSearch: false, enableRoomMode: false, enableCrucible: false, enableWeekView: false,
                                notificationStrategy: 'none'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group"
                        >
                            <i className="fas fa-leaf text-slate-400 group-hover:text-indigo-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Austere</span>
                        </button>
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: true, enableOnlineIndicator: true, enableAppInfo: true, enableCourseSearch: true, enableRoomMode: true,
                                enableCrucible: true, enableWeekView: true,
                                enableEvents: false, enableAuraAI: false,
                                notificationStrategy: 'after_free'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-[0_8px_30px_rgba(79,70,229,0.15)] group"
                        >
                            <i className="fas fa-balance-scale text-indigo-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Harmonized</span>
                        </button>
                        <button
                            onClick={() => saveSettings({
                                ...settings,
                                enableGPA: true, enableEvents: true, enableOnlineIndicator: true, enableAuraAI: true, enableAppInfo: true,
                                enableCourseSearch: true, enableRoomMode: true, enableCrucible: true, enableWeekView: true,
                                notificationStrategy: 'after_free_and_events'
                            })}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-amber-500 transition-all group"
                        >
                            <i className="fas fa-gem text-slate-400 group-hover:text-amber-500"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Opulent</span>
                        </button>
                    </div>
                </div>

                {/* Toggles */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-calculator text-indigo-500 w-5"></i> Academic GPA
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Integrate the GPA analytic utility into your dashboard.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableGPA')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableGPA ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableGPA ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-calendar-alt text-amber-500 w-5"></i> Event Chronicle
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Toggle access to the sophisticated event management suite.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableEvents')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableEvents ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableEvents ? 'translate-x-6' : 'translate-x-1'}`} />
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

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-robot text-fuchsia-500 w-5"></i> Aura Intelligence
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Enable high-performance AI-driven scheduling assistance.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableAuraAI')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableAuraAI ? 'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableAuraAI ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-info-circle text-blue-500 w-5"></i> Knowledge Hub
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Access detailed application insights and documentation.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableAppInfo')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableAppInfo ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableAppInfo ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6 px-2">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 tracking-tight italic">Global Persona</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Switch your primary academic lens.</p>
                        </div>
                        <select
                            value={settings.defaultMode}
                            onChange={(e) => saveSettings({ ...settings, defaultMode: e.target.value as any })}
                            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl px-4 py-2 border border-slate-200 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="student">STUDENT</option>
                            <option value="teacher">LECTURER</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-search text-slate-400 w-5"></i> Course Discovery
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Activate advanced subject lookup within the dashboard.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableCourseSearch')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableCourseSearch ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableCourseSearch ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-door-open text-orange-500 w-5"></i> Room Mode
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Enable Room Timetable search mode.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableRoomMode')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableRoomMode ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableRoomMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-chair text-purple-500 w-5"></i> Crucible Protocol
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Toggle all examination and seating allocations.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableCrucible')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableCrucible ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableCrucible ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
                                <i className="fas fa-calendar-week text-indigo-400 w-5"></i> Week View Chronicle
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Toggle the high-density weekly schedule outlook.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('enableWeekView')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${settings.enableWeekView ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${settings.enableWeekView ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 pt-6 px-2">
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 tracking-tight italic">Intelligence Alerts</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Configure high-priority notification protocols.</p>
                        </div>
                        <select
                            value={settings.notificationStrategy}
                            onChange={(e) => saveSettings({ ...settings, notificationStrategy: e.target.value as any })}
                            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black rounded-xl px-4 py-3 border border-slate-200 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer w-full"
                        >
                            {settings.enableEvents && (
                                <>
                                    <option value="after_free_and_events">POST-RESUME INTELLIGENCE & EVENT CHRONICLE</option>
                                    <option value="all_classes_and_events">COMPREHENSIVE CLASS ALERTS & EVENT CHRONICLE</option>
                                    <option value="events_only">CHRONICLE EVENTS EXCLUSIVE</option>
                                </>
                            )}
                            <option value="after_free">POST-RESUME INTELLIGENCE</option>
                            <option value="all_classes">COMPREHENSIVE CLASS ALERTS</option>
                            <option value="none">SILENT MODE</option>
                        </select>
                        {settings.notificationStrategy !== 'none' && (
                            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-2xl p-4 flex items-start gap-3 mt-1">
                                <i className="fas fa-shield-alt text-indigo-500 mt-1 text-sm"></i>
                                <p className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed font-bold tracking-tight block">
                                    <span className="uppercase text-[9px] block mb-1">Architecture Protocol</span>
                                    Intelligence alerts remain active offline. For optimal synchronization, ensure frequent application heartbeat by maintaining an active session.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 flex justify-center border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-center leading-relaxed">
                        Configurations are persisted locally.<br />Presets override current selections.
                    </p>
                </div>
            </div>
        </div>
    );
}
