import { ProcessedSlot } from '@/lib/parser';
import { memo } from 'react';

interface ProcessSlotCardProps {
    slotData: ProcessedSlot;
    index?: number;
    day?: string;
    isActive?: boolean;
}

const ProcessSlotCard = memo(function ProcessSlotCard({ slotData, index = 0, day, isActive = false }: ProcessSlotCardProps) {
    const { time, entries } = slotData;

    // Stagger delay
    const delay = Math.min(index * 100, 1000);
    const style = { animationDelay: `${delay}ms` };

    // -------------------------------------------------------------------------
    // RENDER: FREE SLOT
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // RENDER: FREE SLOT
    // -------------------------------------------------------------------------
    if (!entries || entries.length === 0) {

        const activeContainerClass = isActive
            ? 'shadow-xl shadow-indigo-600/30 scale-[1.03] z-20'
            : 'md:hover:scale-[1.01] active:scale-[0.98] transition-transform';

        const freeCardBg = isActive
            ? 'bg-gradient-to-br from-indigo-600/95 to-purple-600/95 border-white/20'
            : 'bg-gradient-to-br from-emerald-50/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 border-white/50 dark:border-white/5';

        const freeContainerGradient = isActive
            ? 'from-indigo-600 to-purple-600 border-indigo-400/50'
            : 'from-emerald-500/5 via-emerald-500/0 to-transparent dark:from-emerald-900/10 dark:via-transparent border-emerald-100/50 dark:border-emerald-500/20';

        return (
            <div
                className={`animate-fade-in-up mb-5 p-[1px] rounded-2xl bg-gradient-to-br border shadow-sm transition-all duration-300 ${freeContainerGradient} ${activeContainerClass}`}
                style={style}
                data-active={isActive ? "true" : "false"}
            >
                <div className={`relative p-3 md:p-5 rounded-xl ${freeCardBg} backdrop-blur-none md:backdrop-blur-md h-full flex flex-col justify-between overflow-hidden group`}>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-10 -mt-10 md:group-hover:bg-emerald-400/20 transition-all duration-500"></div>

                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest self-start z-10 flex items-center gap-1.5 ${isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-ping' : 'bg-emerald-400'}`}></div>
                        {time}
                        {isActive && <span className="ml-2 text-[8px] md:text-[9px] bg-white text-indigo-600 px-1.5 py-0.5 rounded-sm shadow-sm animate-pulse">NOW</span>}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center pt-2 pb-2 z-10">
                        <div className={`text-lg md:text-2xl font-black tracking-[0.25em] drop-shadow-sm md:group-hover:scale-110 transition-transform duration-300 ${isActive ? 'text-white' : 'text-emerald-500/90 dark:text-emerald-400'}`}>
                            FREE
                        </div>
                        <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wide mt-1 ${isActive ? 'text-indigo-100' : 'text-emerald-600/40 dark:text-emerald-300/30'}`}>
                            No Classes Scheduled
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: OCCUPIED SLOT
    // -------------------------------------------------------------------------
    const isLab = slotData.entries.some(e => e.isLab);

    // Default Styles (Inactive)
    let containerGradient = isLab
        ? 'from-amber-500/5 via-amber-500/0 to-transparent dark:from-amber-900/10 dark:via-transparent'
        : 'from-blue-500/5 via-blue-500/0 to-transparent dark:from-blue-900/10 dark:via-transparent';

    let borderColor = isLab
        ? 'border-amber-100/50 dark:border-amber-500/20 md:group-hover:border-amber-200 md:dark:group-hover:border-amber-500/40'
        : 'border-blue-100/50 dark:border-blue-500/20 md:group-hover:border-blue-200 md:dark:group-hover:border-blue-500/40';

    let cardBg = isLab
        ? 'bg-gradient-to-br from-amber-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60'
        : 'bg-gradient-to-br from-blue-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60';

    let accentColor = isLab ? 'bg-amber-500' : 'bg-blue-500';

    // ACTIVE STYLES OVERRIDE (Purplish Blue Theme)
    if (isActive) {
        containerGradient = 'from-indigo-600 to-purple-600'; // Full solid gradient background for container
        borderColor = 'border-indigo-400/50';
        cardBg = 'bg-gradient-to-br from-indigo-600/95 to-purple-600/95'; // Inner card is also dark active theme
        accentColor = 'bg-white'; // White accent line
    }

    const activeOuterClass = isActive
        ? 'shadow-xl shadow-indigo-600/30 scale-[1.03] z-20 transform'
        : 'md:hover:shadow-lg md:hover:shadow-blue-500/5 md:dark:hover:shadow-blue-900/10 md:hover:scale-[1.01] active:scale-[0.99] transition-transform';

    return (
        <div
            className={`animate-fade-in-up mb-5 p-[1px] rounded-2xl bg-gradient-to-br ${containerGradient} border ${borderColor} shadow-sm transition-all duration-300 group ${activeOuterClass}`}
            style={style}
            data-active={isActive ? "true" : "false"}
        >
            <div className={`relative p-3 md:p-5 rounded-xl ${cardBg} backdrop-blur-none md:backdrop-blur-md border ${isActive ? 'border-white/20' : 'border-white/50 dark:border-white/5'} overflow-hidden h-full`}>

                {/* Visual accent line on left */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 ${accentColor} rounded-r-full ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}></div>

                {entries.length > 1 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-red-500 to-red-600 text-white text-[8px] md:text-[9px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-bl-xl z-10 shadow-sm uppercase tracking-widest flex items-center gap-1">
                        <i className="fas fa-exclamation-triangle text-[8px]"></i>
                        CLASH
                    </div>
                )}

                {entries.map((s, idx) => {
                    // Tag Styles
                    let tagBg = s.isLab
                        ? 'bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50'
                        : 'bg-blue-100/80 text-blue-800 border-blue-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50';

                    if (isActive) {
                        tagBg = 'bg-white/20 text-white border-white/30 backdrop-blur-md';
                    }

                    // Text Styles
                    const labelColor = isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500';
                    const mainTextColor = isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100';
                    const secondaryTextColor = isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400';
                    const iconBg = isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
                    const badgeColor = isActive ? 'bg-white text-indigo-600' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300';
                    const roomLabelColor = isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500';

                    return (
                        <div key={idx}>
                            {idx > 0 && <hr className={`my-3 md:my-5 border-dashed ${isActive ? 'border-white/20' : 'border-slate-200/60 dark:border-slate-700/50'}`} />}
                            <div className="flex justify-between items-start gap-2 md:gap-4 pl-2 md:pl-3">
                                <div className="flex flex-col flex-1">
                                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2 ${labelColor}`}>
                                        <i className={`far fa-clock ${isActive ? 'text-indigo-200' : 'text-slate-300 dark:text-slate-600'}`}></i> {time}
                                        {isActive && <span className="ml-2 text-[8px] md:text-[9px] bg-white text-indigo-600 px-1.5 md:px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">NOW</span>}
                                    </div>
                                    <div className={`font-extrabold text-base md:text-lg leading-snug mb-1 md:mb-2 tracking-tight ${mainTextColor}`}>
                                        {s.course}
                                    </div>
                                    <div className={`text-[10px] md:text-xs font-semibold flex items-center gap-1.5 md:gap-2 mt-auto ${secondaryTextColor}`}>
                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[10px] ${iconBg}`}>
                                            <i className="fas fa-chalkboard-teacher"></i>
                                        </div>
                                        {s.instructor}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end text-right space-y-2 md:space-y-3">
                                    <span className={`inline-block text-[8px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-lg shadow-sm border tracking-[0.05em] backdrop-blur-sm ${tagBg}`}>
                                        {s.isLab ? 'LAB' : 'LECTURE'}
                                    </span>

                                    <div className="flex flex-col items-end gap-0.5 md:gap-1">
                                        <div className={`text-[10px] md:text-xs font-bold flex items-center justify-end gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border ${isActive ? 'border-white/20 bg-white/10 text-white' : badgeColor}`}>
                                            <span className={`text-[8px] md:text-[10px] ${roomLabelColor}`}>ROOM</span>
                                            {s.room}
                                        </div>
                                        <div className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-1 ${roomLabelColor}`}>
                                            {s.class}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default ProcessSlotCard;
