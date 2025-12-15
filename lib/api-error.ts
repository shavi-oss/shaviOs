import { toast } from 'sonner';

export class ApiError extends Error {
    statusCode: number;
    details?: any;

    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

export const handleApiError = (error: unknown) => {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        toast.error(error.message);
        return;
    }

    if (error instanceof Error) {
        toast.error(error.message);
        return;
    }

    toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
};

export const logError = async (error: Error, info?: any) => {
    try {
        // Log to Supabase error_logs table via API route or direct client if needed
        // Ideally this goes to an API route to avoid exposing full Supabase client with write access here if restricted
        // For now, we'll just log to console, but this is where we'd call /api/log-error

        await fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                componentStack: info?.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent
            })
        });
    } catch (e) {
        console.error('Failed to log error:', e);
    }
};
