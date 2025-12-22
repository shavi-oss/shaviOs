'use client';
 
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);
 
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
            <h1 className="text-4xl font-bold mb-4 text-red-600">نعتذر، حدث خطأ جسيم</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
                حدثت مشكلة غير متوقعة أدت إلى توقف التطبيق.
            </p>
            <Button onClick={() => reset()} className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                إعادة المحاولة
            </Button>
        </div>
      </body>
    </html>
  );
}
