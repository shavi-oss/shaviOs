'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/api-error';
import { Button } from './button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to our service
        logError(error, errorInfo);
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl text-destructive">حدث خطأ غير متوقع</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            <p className="mb-2">نعتذر، حدثت مشكلة أثناء عرض هذا المحتوى.</p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mt-4 rounded bg-background/50 p-2 text-xs text-left font-mono dir-ltr overflow-auto max-h-32">
                                    {this.state.error.message}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                                <RefreshCcw className="h-4 w-4" />
                                تحديث الصفحة
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
