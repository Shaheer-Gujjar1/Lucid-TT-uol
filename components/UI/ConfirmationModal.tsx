'use client';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'warning'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: 'text-red-500 bg-red-100 dark:bg-red-900/30',
            button: 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'
        },
        warning: {
            icon: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
            button: 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30'
        },
        info: {
            icon: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
            button: 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30'
        }
    };

    const theme = colors[type];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white/95 dark:bg-slate-900/95 w-full max-w-sm rounded-[2rem] shadow-2xl animate-scale-in border border-white/20 dark:border-slate-700 overflow-hidden transform transition-all backdrop-blur-xl">
                <div className="p-8 text-center">
                    <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${theme.icon} text-3xl shadow-sm rotate-3 feature-icon`}>
                        <i className={`fas fa-${type === 'danger' ? 'trash-alt' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}`}></i>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                        {title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 px-2">
                        {message}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors text-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 text-sm ${theme.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
