
'use client';

import { useState, useEffect } from 'react';

interface DeveloperDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
}

const PIN = "22485";
const MAX_TRIES = 4;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

export default function DeveloperDownloadModal({ isOpen, onClose, onProceed }: DeveloperDownloadModalProps) {
    const [inputPin, setInputPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setInputPin('');
            setError(null);
            return;
        }

        checkLockout();
    }, [isOpen]);

    const checkLockout = () => {
        const lockoutData = localStorage.getItem('lucid_dev_lockout');
        if (lockoutData) {
            const { timestamp, tries } = JSON.parse(lockoutData);
            const now = Date.now();
            if (tries >= MAX_TRIES && now - timestamp < LOCKOUT_DURATION) {
                setIsLocked(true);
                setRemainingTime(Math.ceil((LOCKOUT_DURATION - (now - timestamp)) / 60000));
            } else if (now - timestamp >= LOCKOUT_DURATION) {
                localStorage.removeItem('lucid_dev_lockout');
                setIsLocked(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        if (inputPin === PIN) {
            localStorage.removeItem('lucid_dev_lockout');
            onProceed();
            onClose();
        } else {
            const lockoutData = localStorage.getItem('lucid_dev_lockout');
            const now = Date.now();
            let newTries = 1;

            if (lockoutData) {
                const { timestamp, tries } = JSON.parse(lockoutData);
                if (now - timestamp < LOCKOUT_DURATION) {
                    newTries = tries + 1;
                }
            }

            localStorage.setItem('lucid_dev_lockout', JSON.stringify({ timestamp: now, tries: newTries }));

            if (newTries >= MAX_TRIES) {
                setIsLocked(true);
                setRemainingTime(60);
                setError("Maximum attempts exceeded. Security lockout active for 1 hour.");
            } else {
                setError(`Invalid Credentials. ${MAX_TRIES - newTries} attempts remaining.`);
            }
            setInputPin('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/5 animate-slide-up transform transition-all">

                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-purple-600"></div>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm border border-red-100 dark:border-red-500/20 animate-pulse">
                            <i className="fas fa-user-shield text-2xl"></i>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic">Developer Access Required</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2">Strict Authentication Protocol</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                                This specialized export utility is reserved for development and architectural verification only. Enter your developer credentials to initiate the chronicle export.
                            </p>
                        </div>

                        {!isLocked ? (
                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                                <div className="relative">
                                    <input
                                        type="password"
                                        maxLength={5}
                                        value={inputPin}
                                        onChange={(e) => setInputPin(e.target.value)}
                                        placeholder="Enter 5-digit PIN"
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-4 text-center text-2xl font-black tracking-[0.5em] rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-white transition-all shadow-inner placeholder:text-xs placeholder:tracking-widest"
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-shake">
                                        <i className="fas fa-exclamation-circle mr-1"></i> {error}
                                    </p>
                                )}
                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={inputPin.length < 5}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-xl"
                                    >
                                        Authenticate
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="w-full py-8 px-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-3xl flex flex-col items-center gap-4 animate-shake">
                                <i className="fas fa-lock text-red-500 text-3xl"></i>
                                <div className="text-center">
                                    <p className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Security Lockout Active</p>
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">Retry in {remainingTime} minutes</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
