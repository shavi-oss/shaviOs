"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    Briefcase,
    TrendingUp,
    Target,
    FileText,
    PieChart,
    Plus,
    Users,
    ArrowUpRight
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface SalesStats {
    totalRevenue: number;
    activeDeals: number;
    winRate: number;
    pipelineValue: number;
}

export default function SalesDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSalesStats() {
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();

                // Fetch all deals
                const { data: deals, error } = await supabase
                    .from('deals')
                    .select('id, value, stage, currency');

                if (error) {
                    console.warn('Unable to fetch deals (table may be empty or inaccessible):', error.message || 'No details');
                    setStats({
                        totalRevenue: 0,
                        activeDeals: 0,
                        winRate: 0,
                        pipelineValue: 0
                    });
                    setLoading(false);
                    return;
                }

                // If no deals, show zeros
                if (!deals || deals.length === 0) {
                    setStats({
                        totalRevenue: 0,
                        activeDeals: 0,
                        winRate: 0,
                        pipelineValue: 0
                    });
                    setLoading(false);
                    return;
                }

                // Calculate stats from real data
                const closedWonDeals = deals.filter(d => d.stage === 'closed_won');
                const closedLostDeals = deals.filter(d => d.stage === 'closed_lost');
                const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');

                const totalRevenue = closedWonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
                const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

                // Calculate win rate: (closed won / (closed won + closed lost)) * 100
                const totalClosed = closedWonDeals.length + closedLostDeals.length;
                const winRate = totalClosed > 0
                    ? (closedWonDeals.length / totalClosed) * 100
                    : 0;

                setStats({
                    totalRevenue,
                    activeDeals: activeDeals.length,
                    winRate,
                    pipelineValue
                });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch sales stats:', err);
                // Fallback to zeros on error
                setStats({
                    totalRevenue: 0,
                    activeDeals: 0,
                    winRate: 0,
                    pipelineValue: 0
                });
                setLoading(false);
            }
        }

        fetchSalesStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل لوحة المبيعات...</p>
                </div>
            </div>
        );
    }

    const TOOLS = [
        { label: 'إدارة الصفقات', icon: Briefcase, path: '/sales/deals', color: 'bg-blue-50 text-blue-600' },
        { label: 'خط الأنابيب (Pipeline)', icon: TrendingUp, path: '/sales/pipeline', color: 'bg-purple-50 text-purple-600' },
        { label: 'أهداف المبيعات', icon: Target, path: '/sales/targets', color: 'bg-red-50 text-red-600' },
        { label: 'مولد العروض (Quotes)', icon: FileText, path: '/sales/quotes/new', color: 'bg-green-50 text-green-600' },
        { label: 'العمولات', icon: DollarSign, path: '/sales/commissions', color: 'bg-yellow-50 text-yellow-600' },
    ];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">المبيعات</h1>
                    <p className="text-muted-foreground mt-2">
                        لوحة التحكم المركزية لفريق المبيعات
                    </p>
                </div>
                <button
                    onClick={() => router.push('/sales/deals/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    صفقة جديدة
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="الإيرادات (Revenue)"
                    value={`${(stats?.totalRevenue || 0) / 1000}K EGP`}
                    icon={DollarSign}
                    description="هذا الربع السنوي"
                    trend={{ value: 15.3, isPositive: true }}
                />
                <StatCard
                    title="الصفقات النشطة"
                    value={stats?.activeDeals || 0}
                    icon={Briefcase}
                    description="في جميع المراحل"
                />
                <StatCard
                    title="معدل الإغلاق (Win Rate)"
                    value={`${stats?.winRate || 0}%`}
                    icon={Target}
                    description="نسبة النجاح"
                    trend={{ value: 3.5, isPositive: true }}
                />
                <StatCard
                    title="قيمة Pipeline"
                    value={`${(stats?.pipelineValue || 0) / 1000}K EGP`}
                    icon={TrendingUp}
                    description="متوقع إغلاقها"
                />
            </div>

            {/* Tools Grid */}
            <div>
                <h2 className="text-xl font-bold mb-4">أدوات المبيعات</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {TOOLS.map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => router.push(tool.path)}
                                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-lg transition-all text-center flex flex-col items-center gap-3"
                            >
                                <div className={`p-3 rounded-full ${tool.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-sm">{tool.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity Section (Mock for now) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">آخر التحديثات</h3>
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        عرض الكل <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="font-medium text-sm">تم تحديث حالة صفقة "شركة النور"</p>
                                    <p className="text-xs text-gray-500">بواسطة أحمد محمد • منذ ساعتين</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">Negotiation</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
