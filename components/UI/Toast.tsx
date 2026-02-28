
'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entry animation shortly after mount for rendering tick
        const enterFrame = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setVisible(true);
            });
        });

        const exitTimer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 400); // Wait for exit animation class to finish rendering
        }, duration);

        return () => {
            cancelAnimationFrame(enterFrame);
            clearTimeout(exitTimer);
        };
    }, [duration, onClose]);

    // Simple aesthetic heuristics based on common message intent
    const isError = message.toLowerCase().includes('failed') ||
        message.toLowerCase().includes('error') ||
        message.toLowerCase().includes('restricted') ||
        message.toLowerCase().includes('clear');

    // Dynamic theme applying modern system gradients
    const theme = isError
        ? {
            icon: 'fa-exclamation-circle',
            iconColor: 'text-rose-500 dark:text-rose-400',
            glowColor: 'bg-rose-500',
            barColor: 'from-rose-500 to-orange-500',
        }
        : {
            icon: 'fa-check-circle',
            iconColor: 'text-indigo-500 dark:text-indigo-400',
            glowColor: 'bg-indigo-500',
            barColor: 'from-indigo-500 to-purple-600',
        };

    return (
        <div className="fixed bottom-24 md:bottom-12 left-1/2 transform -translate-x-1/2 z-[2500] pointer-events-none flex flex-col items-center">
            <div
                className={`
                    relative overflow-hidden pointer-events-auto
                    flex items-center gap-3 md:gap-4 px-4 py-3 md:px-5 md:py-3.5 rounded-2xl
                    bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                    border border-white/60 dark:border-slate-700/60
                    shadow-[0_8px_32px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.5)]
                    transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${visible && !isExiting ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}
                `}
            >
                {/* Subtle soft backdrop glow */}
                <div className={`absolute -inset-1 opacity-10 dark:opacity-20 blur-xl ${theme.glowColor} mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000`} />

                {/* Left accent racing stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.barColor} rounded-l-2xl opacity-90`} />

                {/* Shiny Icon Receptacle */}
                <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100/80 dark:border-slate-700/80 shadow-inner">
                    <div className={`absolute inset-0 blur-md opacity-30 ${theme.glowColor} rounded-full`} />
                    <i className={`fas ${theme.icon} ${theme.iconColor} text-[15px] relative drop-shadow-sm`}></i>
                </div>

                {/* Formatted Message Payload */}
                <div className="relative text-[13px] md:text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight pr-2 md:pr-4">
                    {message}
                </div>

                {/* Micro-interaction Close Button */}
                <button
                    onClick={() => { setIsExiting(true); setTimeout(onClose, 400); }}
                    className="relative -ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-70 hover:opacity-100 focus:outline-none"
                    aria-label="Dismiss"
                >
                    <i className="fas fa-times text-[11px]"></i>
                </button>

                {/* Decreasing Lifetime Progress Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50 dark:bg-slate-800/50 overflow-hidden rounded-b-2xl">
                    <div
                        className={`h-full bg-gradient-to-r ${theme.barColor} shadow-[0_0_12px_currentColor] rounded-r-full`}
                        style={{
                            width: visible && !isExiting ? '0%' : '100%',
                            transition: visible && !isExiting ? `width ${duration}ms linear` : 'none'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
