"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database as DatabaseIcon, Shield, Table, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Database } from '@/lib/database.types';

interface TableStats {
    name: string;
    count: number | null;
    error: string | null;
    sampleData: any[] | null;
}

export default function DebugDatabasePage() {
    // List of main tables to check
    const tablesToCheck: any[] = [
        'employees',
        'leave_requests',
        'payroll_records',
        'expenses',
        'budgets',
        'invoices',
        'deals',
        'leads',
        'campaigns',
        'email_campaigns',
        'profiles'
    ];
    
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [tables, setTables] = useState<TableStats[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string>('user');

    useEffect(() => {
        checkDatabase();
    }, []);

    const checkDatabase = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                alert('لم يتم تسجيل الدخول!');
                return;
            }

            setUserId(user.id);

            // Get user profile to check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = profile?.role || user.user_metadata?.role || 'user';
            setUserRole(role);

            // Only allow admin access
            if (!['admin', 'developer'].includes(role)) {
                alert('⛔ هذه الصفحة متاحة للـ Admins فقط!');
                return;
            }

            // Check each table
            const results: TableStats[] = [];
            
            for (const tableName of tablesToCheck) {
                try {
                    // Try to count rows
                    const { count, error: countError } = await supabase
                        .from(tableName as any)
                        .select('*', { count: 'exact', head: true });

                    // Try to fetch sample data (first 3 rows)
                    const { data: sampleData, error: dataError } = await supabase
                        .from(tableName as any)
                        .select('*')
                        .limit(3);

                    results.push({
                        name: tableName,
                        count: countError ? null : count,
                        error: countError?.message || dataError?.message || null,
                        sampleData: dataError ? null : sampleData
                    });
                } catch (err: any) {
                    results.push({
                        name: tableName,
                        count: null,
                        error: err.message || 'Unknown error',
                        sampleData: null
                    });
                }
            }

            setTables(results);
        } catch (err) {
            console.error('Debug check failed:', err);
            alert('فشل فحص قاعدة البيانات');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري فحص قاعدة البيانات...</p>
                </div>
            </div>
        );
    }

    if (userRole && !['admin', 'developer'].includes(userRole)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">وصول محظور</h1>
                    <p className="text-red-600 dark:text-red-300">هذه الصفحة متاحة للمسؤولين فقط</p>
                </div>
            </div>
        );
    }

    const successCount = tables.filter(t => t.error === null).length;
    const errorCount = tables.filter(t => t.error !== null).length;
    const emptyCount = tables.filter(t => t.count === 0).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <DatabaseIcon className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">🔧 Database Debug Panel</h1>
                </div>
                <p className="text-purple-100">صفحة تشخيص قاعدة البيانات - للمسؤولين فقط</p>
                <div className="mt-4 flex gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">User ID: {userId?.substring(0, 8)}...</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Role: {userRole}</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <form action={async () => {
                    const { fixAdminProfile } = await import('@/app/actions/debug');
                    await fixAdminProfile();
                    checkDatabase();
                }}>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium">
                        🛠️ Fix My Admin Profile
                    </button>
                </form>

                <form action={async () => {
                    const { seedSampleData } = await import('@/app/actions/debug');
                    await seedSampleData();
                    checkDatabase();
                }}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                        🌱 Seed Sample Data
                    </button>
                </form>

                <form action={async () => {
                    const { verifyBudgetSystem } = await import('@/app/actions/debug');
                    const result = await verifyBudgetSystem();
                    if (result.success) {
                        alert(result.data?.message || 'Success');
                    } else {
                        alert(`Error: ${result.error}`);
                    }
                }}>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                        💰 Verify Dynamic Budgets
                    </button>
                </form>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">إجمالي الجداول</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{tables.length}</p>
                        </div>
                        <Table className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700 dark:text-green-400 text-sm">جداول تعمل</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-300">{successCount}</p>
                        </div>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-700 dark:text-red-400 text-sm">جداول بها أخطاء</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-300">{errorCount}</p>
                        </div>
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-700 dark:text-yellow-400 text-sm">جداول فارغة</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">{emptyCount}</p>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Tables List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل الجداول</h2>
                
                {tables.map((table) => (
                    <div 
                        key={table.name}
                        className={`p-4 rounded-xl border ${
                            table.error 
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800' 
                                : table.count === 0
                                ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-800'
                                : 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                {table.error ? (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                ) : table.count === 0 ? (
                                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                )}
                                <span className="font-bold text-lg">{table.name}</span>
                            </div>
                            {table.count !== null && (
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
                                    {table.count} صف
                                </span>
                            )}
                        </div>

                        {table.error && (
                            <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <p className="text-red-700 dark:text-red-400 text-sm font-mono">
                                    ❌ {table.error}
                                </p>
                            </div>
                        )}

                        {table.sampleData && table.sampleData.length > 0 && (
                            <details className="mt-3">
                                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    عرض عينة من البيانات ({table.sampleData.length} صف)
                                </summary>
                                <div className="mt-2 overflow-x-auto">
                                    <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                                        {JSON.stringify(table.sampleData, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        )}

                        {table.count === 0 && !table.error && (
                            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
                                ⚠️ الجدول فارغ - لا توجد بيانات
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
                <button
                    onClick={checkDatabase}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <DatabaseIcon className="w-5 h-5" />
                    إعادة الفحص
                </button>
            </div>
        </div>
    );
}
