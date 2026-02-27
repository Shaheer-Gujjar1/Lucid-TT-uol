
export default function Footer() {
    return (
        <footer className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl mt-20 py-10 text-center shadow-[0_-8px_32px_rgba(0,0,0,0.06)] rounded-[3rem] mx-4 mb-4 border border-white/40 dark:border-slate-800/50">
            <div className="max-w-4xl mx-auto px-6">
                <p className="text-slate-700 dark:text-slate-200 font-black text-lg tracking-tight mb-4">
                    <i className="fas fa-laptop-code text-indigo-500 mr-3"></i>Designed & Developed by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Shaheer Ahmed</span>
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    <a href="mailto:chaudharyshaheer382@gmail.com" className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <i className="fas fa-envelope text-indigo-400"></i> chaudharyshaheer382@gmail.com
                    </a>
                    <span className="hidden md:block text-slate-300 dark:text-slate-700">|</span>
                    <p className="flex items-center gap-2">
                        <i className="fas fa-code-branch text-purple-400"></i> v6.11.5

                    </p>
                </div>
            </div>
        </footer>
    );
}
