'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error using our centralized logger
        logger.error("Global Error Boundary Caught Error", { error });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-gray-500 max-w-md">
                We apologize for the inconvenience. An unexpected error occurred while loading this section.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-auto max-w-2xl w-full">
                    <p className="font-mono text-sm text-red-600">{error.message}</p>
                    {error.digest && (
                        <p className="text-xs text-gray-500 mt-2">Digest: {error.digest}</p>
                    )}
                </div>
            )}
        </div>
    );
}
