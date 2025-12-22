"use client";

import { Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SLATimerProps {
    slaDueAt: string | null;
    status: string;
}

export function SLATimer({ slaDueAt, status }: SLATimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [percentage, setPercentage] = useState<number>(100);
    const [isBreached, setIsBreached] = useState(false);

    useEffect(() => {
        if (!slaDueAt || status === 'resolved' || status === 'closed') {
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const due = new Date(slaDueAt).getTime();
            const diff = due - now;

            if (diff <= 0) {
                setIsBreached(true);
                setTimeRemaining('SLA BREACHED');
                setPercentage(0);
                return;
            }

            // Calculate time remaining
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setTimeRemaining(`${days}d ${hours % 24}h`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m`);
            } else {
                setTimeRemaining(`${minutes}m`);
            }

            // Calculate percentage (assuming 24h total for now)
            const totalTime = 24 * 60 * 60 * 1000; // 24 hours in ms
            const pct = Math.max(0, Math.min(100, ((totalTime - diff) / totalTime) * 100));
            setPercentage(100 - pct);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [slaDueAt, status]);

    if (!slaDueAt || status === 'resolved' || status === 'closed') {
        return null;
    }

    // Color coding based on percentage
    let colorClass = 'text-green-600 bg-green-50 dark:bg-green-900/20';
    let iconClass = 'text-green-600';
    
    if (isBreached) {
        colorClass = 'text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse';
        iconClass = 'text-red-600';
    } else if (percentage < 20) {
        colorClass = 'text-red-600 bg-red-50 dark:bg-red-900/20';
        iconClass = 'text-red-600';
    } else if (percentage < 50) {
        colorClass = 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
        iconClass = 'text-yellow-600';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {isBreached ? (
                <AlertTriangle className={`w-3.5 h-3.5 ${iconClass}`} />
            ) : (
                <Clock className={`w-3.5 h-3.5 ${iconClass}`} />
            )}
            <span>{timeRemaining}</span>
        </div>
    );
}
