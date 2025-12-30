
'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-6 py-3 rounded-full font-medium shadow-lg z-[2000] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {message}
        </div>
    );
}
