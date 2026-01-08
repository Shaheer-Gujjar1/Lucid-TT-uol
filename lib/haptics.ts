export const triggerHaptic = (pattern: number | number[] = 12) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        console.log('[Haptics] Triggered with pattern:', pattern);
        navigator.vibrate(pattern);
    } else {
        console.warn('[Haptics] Not supported or navigator undefined');
    }
};
