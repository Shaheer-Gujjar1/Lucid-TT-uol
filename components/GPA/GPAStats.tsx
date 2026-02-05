'use client';

import { useState, useEffect, useRef } from 'react';
import { Semester, calculateSemesterGPA } from '@/lib/gpa_utils';

interface GPAStatsProps {
    cgpa: number;
    totalCredits: number;
    semesters: Semester[];
    previousCGPA?: number;
}

const useAnimatedCounter = (end: number, duration: number = 1000) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const start = countRef.current;
        startTimeRef.current = null;

        const step = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            const current = start + (end - start) * ease;
            setCount(current);
            countRef.current = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [end, duration]);

    return count;
};

const GPAChart = ({ semesters, previousCGPA = 0 }: { semesters: Semester[], previousCGPA?: number }) => {

    if (semesters.length === 0) return <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-8 italic">Add semesters to see trend</div>;

    // Calculate GPA history ensuring at least 2 points for a line
    const history = [{ name: 'Start', gpa: previousCGPA || 0 }];

    semesters.forEach((semester, index) => {
        const { gpa } = calculateSemesterGPA(semester.subjects);
        history.push({ name: `Sem ${index + 1}`, gpa });
    });

    const maxGPA = 4.0;
    const height = 100;
    const width = 200;
    const padding = 10;

    const points = history.map((point, index) => {
        const x = padding + (index / (history.length - 1 || 1)) * (width - 2 * padding);
        const y = height - padding - (point.gpa / maxGPA) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area */}
                {history.length > 1 && (
                    <path
                        d={`M ${padding},${height} ${points.split(' ')[0]} L ${points.replace(/,/g, ' ')} L ${width - padding},${height} Z`}
                        fill="url(#chartGradient)"
                    />
                )}
                {/* Line */}
                <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    points={points}
                    className="drop-shadow-md"
                />
                {/* Points */}
                {history.map((point, index) => {
                    const x = padding + (index / (history.length - 1 || 1)) * (width - 2 * padding);
                    const y = height - padding - (point.gpa / maxGPA) * (height - 2 * padding);
                    return (
                        <g key={index} className="group/point hover:scale-110 transition-transform origin-center cursor-pointer">
                            <circle cx={x} cy={y} r="4" className="fill-white stroke-indigo-600 stroke-2" />
                            {/* Tooltip */}
                            <foreignObject x={x - 20} y={y - 35} width="40" height="25" className="overflow-visible opacity-0 group-hover/point:opacity-100 transition-opacity">
                                <div className="bg-slate-800 text-white text-[9px] rounded py-1 px-1.5 text-center font-bold shadow-lg">
                                    {point.gpa.toFixed(2)}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


const GPAStats = ({ cgpa, totalCredits, semesters, previousCGPA }: GPAStatsProps) => {
    const animatedCGPA = useAnimatedCounter(cgpa, 1500);
    const [isExpanded, setIsExpanded] = useState(false);

    // Trend Logic
    const [trend, setTrend] = useState<'up' | 'down' | null>(null);
    const prevCountRef = useRef(cgpa);

    useEffect(() => {
        if (prevCountRef.current !== cgpa) {
            if (cgpa > prevCountRef.current) setTrend('up');
            else if (cgpa < prevCountRef.current) setTrend('down');

            prevCountRef.current = cgpa;

            // Reset blink after animation
            const timer = setTimeout(() => setTrend(null), 600);
            return () => clearTimeout(timer);
        }
    }, [cgpa]);

    // Circular Progress Logic
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedCGPA / 4.0) * circumference;
    const strokeDashoffset = circumference - progress;

    // Dynamic Styles based on Trend
    const glowColor = trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-red-500' : 'bg-indigo-500';
    const borderColor = trend === 'up' ? 'border-emerald-500' : trend === 'down' ? 'border-red-500' : 'border-slate-100 dark:border-slate-800';

    return (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse md:flex-row items-start md:items-end gap-4">
            {/* Stats Widget */}
            <div
                className="relative group/widget cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Breathing Glow Background - Blinks on change */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-500 ${glowColor} ${trend ? 'animate-pulse' : 'animate-pulse-slow'}`}></div>

                {/* Main Circle Container */}
                <div className="relative w-22 h-22 md:w-26 md:h-26 flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95">

                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-200 dark:text-slate-800"
                            strokeWidth="6"
                        />
                        {/* Progress Circle (Dynamic) */}
                        <circle
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Inner Content */}
                    <div className={`absolute inset-2 bg-white dark:bg-slate-900 rounded-full shadow-inner flex flex-col items-center justify-center border-[6px] z-10 transition-colors duration-500 ${borderColor}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">CGPA</span>
                        <div className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-pink-500 leading-none pb-1">
                            {animatedCGPA.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Tap to View Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[8px] font-bold py-0.5 px-2 rounded-full whitespace-nowrap opacity-0 group-hover/widget:opacity-100 transition-opacity -translate-y-1 group-hover/widget:translate-y-0 shadow-lg z-20">
                    <i className="fas fa-chart-pie mr-1"></i> {isExpanded ? 'Close' : 'Details'}
                </div>
            </div>

            {/* Expanded Card View (Combined Credits & Graph) */}
            {isExpanded && (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700 p-5 rounded-3xl shadow-2xl animate-fade-in-up w-80 mb-2 ring-1 ring-black/5 dark:ring-white/5">

                    {/* Header with Total Credits */}
                    <div className="flex justify-between items-start mb-6 border-b border-dashed border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Credits Earned</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{totalCredits}</span>
                                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Hrs</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:rotate-90"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>

                    {/* Graph Section */}
                    <div className="mb-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Performance Trend</h3>
                        </div>
                        <div className="h-32 w-full flex items-end p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <GPAChart semesters={semesters} previousCGPA={previousCGPA} />
                        </div>
                    </div>

                    {/* Tip Footer */}
                    <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 leading-tight bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        <i className="fas fa-lightbulb text-amber-500 mt-0.5"></i>
                        <p>Consistent effort builds your legacy. Keep pushing!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GPAStats;
