
'use client';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl animate-scale-in border border-white/20 dark:border-slate-700 overflow-hidden max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <i className="fas fa-info text-white"></i>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Lucid Timetable</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Intro */}
                    <div className="text-center pb-2">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                            Welcome to the all-new <strong>Lucid Timetable v6.1</strong>. <br />
                            Now with a powerful Exam Suite and enhanced dark mode.
                        </p>
                    </div>

                    {/* Modes */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            <i className="fas fa-layer-group"></i> Choose Your Mode
                        </h3>
                        <div className="grid gap-3">
                            <ModeCard
                                icon="fa-user-graduate" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20"
                                title="Student Mode"
                                desc="Find your class schedule by Program, Semester & Section. Save 'Preferences' to load it instantly."
                            />
                            <ModeCard
                                icon="fa-chalkboard-teacher" color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/20"
                                title="Teacher Mode"
                                desc="Search for any instructor to view their complete weekly teaching schedule across all departments."
                            />
                            <ModeCard
                                icon="fa-file-signature" color="text-sky-600 dark:text-sky-400" bg="bg-sky-50 dark:bg-sky-900/20"
                                title="Exam Mode (NEW)"
                                desc="Access the official Datesheet & Seating Plan instantly. Find your exam venue, seat number, and time in seconds."
                            />
                            <ModeCard
                                icon="fa-door-open" color="text-pink-600 dark:text-pink-400" bg="bg-pink-50 dark:bg-pink-900/20"
                                title="Room Mode"
                                desc="Check the availability of any room to find a free slot for self-study."
                            />
                        </div>
                    </section>

                    {/* Features */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            <i className="fas fa-bolt"></i> Powerful Features
                        </h3>
                        <div className="space-y-4">
                            <FeatureRow icon="fa-search" title="Smart Seating Search" desc="Type your Name or ID to instantly find your seat allocation in the exam hall." />
                            <FeatureRow icon="fa-download" title="Export & Print" desc="Download high-quality images of your timetable or print purely." />
                            <FeatureRow icon="fa-calendar-alt" title="Events Hub" desc="Manage assignments, quizzes, and personalized events with reminders." />
                            <FeatureRow icon="fa-moon" title="Enhanced Dark Mode" desc="A completely redesigned dark experience that is easy on the eyes." />
                        </div>
                    </section>

                    {/* Credits */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            <i className="fas fa-code"></i> Developer
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-sm">
                                SA
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Shaheer Ahmed</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">From: BSCS-UOL-SGD</p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center shrink-0">
                    <p className="text-xs text-slate-400 font-bold">Version 6.1.4 • Made with ❤️</p>
                </div>
            </div>
        </div>
    );
}

function ModeCard({ icon, color, bg, title, desc }: { icon: string, color: string, bg: string, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/50">
            <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                <i className={`fas ${icon} text-xl`}></i>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function FeatureRow({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:scale-110 transition-transform">
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">{desc}</p>
            </div>
        </div>
    );
}

function TipRow({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-300">
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
            </div>
        </div>
    );
}
