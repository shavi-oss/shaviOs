"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    AlertTriangle,
    Ticket,
    TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface CSStats {
    overview: {
        active_students: number;
        at_risk_students: number;
    };
    support: {
        open_tickets: number;
    };
    nps: {
        nps_score: number;
    };
}

export default function CustomerSuccessDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<CSStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStats({
                overview: {
                    active_students: 1654,
                    at_risk_students: 23
                },
                support: {
                    open_tickets: 12
                },
                nps: {
                    nps_score: 85
                }
            });
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">نجاح العملاء</h1>
                <p className="text-muted-foreground mt-2">
                    إدارة الطلاب والدعم الفني
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="الطلاب النشطون"
                    value={stats?.overview.active_students || 0}
                    icon={Users}
                    description="طالب نشط حالياً"
                    trend={{ value: 5.2, isPositive: true }}
                />
                <StatCard
                    title="طلاب في خطر"
                    value={stats?.overview.at_risk_students || 0}
                    icon={AlertTriangle}
                    description="يحتاجون متابعة عاجلة"
                    trend={{ value: 12.5, isPositive: false }}
                />
                <StatCard
                    title="تذاكر الدعم المفتوحة"
                    value={stats?.support.open_tickets || 0}
                    icon={Ticket}
                    description="تذكرة قيد المعالجة"
                />
                <StatCard
                    title="درجة NPS"
                    value={`${stats?.nps.nps_score || 0}%`}
                    icon={TrendingUp}
                    description="رضا العملاء"
                    trend={{ value: 8.3, isPositive: true }}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <button
                    onClick={() => router.push('/customer-success/students')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">إدارة الطلاب</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        عرض وإدارة جميع الطلاب المسجلين
                    </p>
                </button>
                <button
                    onClick={() => router.push('/customer-success/tickets')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">تذاكر الدعم</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        متابعة ومعالجة تذاكر الدعم الفني
                    </p>
                </button>
            </div>
        </div>
    );
}
