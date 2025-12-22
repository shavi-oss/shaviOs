'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { logError } from '@/lib/api-error';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        logError(error, { componentStack: error.stack || '' });
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[600px] p-6">
            <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">حدث خطأ في لوحة التحكم</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p className="mb-2">نعتذر، حدثت مشكلة أثناء تحميل بيانات اللوحة.</p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 rounded bg-background/50 p-2 text-xs text-left font-mono dir-ltr overflow-auto max-h-32 border border-destructive/20 text-destructive">
                            {error.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={() => reset()} variant="outline" className="gap-2 border-destructive/20 hover:bg-destructive/10">
                        <RefreshCcw className="h-4 w-4" />
                        محاولة مجدداً
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
