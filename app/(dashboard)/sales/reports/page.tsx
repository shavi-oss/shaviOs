"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Target,
    Calendar,
    Download,
    Filter,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface Deal {
    id: string;
    title: string;
    customer_name: string | null;
    value: number | null;
    stage: string;
    created_at: string;
    expected_close_date?: string | null;
}

interface ReportMetrics {
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    lostDeals: number;
    conversionRate: number;
    avgDealSize: number;
    avgSalesCycle: number;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];

export default function SalesReportsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<ReportMetrics>({
        totalDeals: 0,
        totalValue: 0,
        wonDeals: 0,
        lostDeals: 0,
        conversionRate: 0,
        avgDealSize: 0,
        avgSalesCycle: 0
    });
    const [dateRange, setDateRange] = useState('30'); // days

    useEffect(() => {
        fetchDeals();
    }, [dateRange]);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Calculate date filter
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

            const { data, error } = await supabase
                .from('deals')
                .select('*')
                .gte('created_at', daysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Unable to fetch deals:', error.message || 'Table may be empty');
                setDeals([]);
            } else {
                setDeals(data || []);
                calculateMetrics(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch deals:', err);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (dealsData: Deal[]) => {
        const totalDeals = dealsData.length;
        const wonDeals = dealsData.filter(d => d.stage === 'closed_won').length;
        const lostDeals = dealsData.filter(d => d.stage === 'closed_lost').length;
        const closedDeals = wonDeals + lostDeals;
        const totalValue = dealsData.reduce((sum, d) => sum + (d.value || 0), 0);
        const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;
        const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

        // Calculate average sales cycle
        const dealsWithDates = dealsData.filter(d => d.expected_close_date);
        const avgCycle = dealsWithDates.length > 0
            ? dealsWithDates.reduce((sum, d) => {
                const created = new Date(d.created_at);
                const expected = new Date(d.expected_close_date!);
                const days = Math.floor((expected.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                return sum + Math.abs(days);
            }, 0) / dealsWithDates.length
            : 0;

        setMetrics({
            totalDeals,
            totalValue,
            wonDeals,
            lostDeals,
            conversionRate,
            avgDealSize,
            avgSalesCycle: avgCycle
        });
    };

    // Prepare chart data
    const stageDistribution = [
        { name: 'عميل محتمل', value: deals.filter(d => d.stage === 'lead').length },
        { name: 'تم التواصل', value: deals.filter(d => d.stage === 'contacted').length },
        { name: 'عرض سعر', value: deals.filter(d => d.stage === 'proposal').length },
        { name: 'تفاوض', value: deals.filter(d => d.stage === 'negotiation').length },
        { name: 'نجاح', value: deals.filter(d => d.stage === 'closed_won').length },
        { name: 'خسارة', value: deals.filter(d => d.stage === 'closed_lost').length },
    ].filter(item => item.value > 0);

    // Monthly trend
    const getLast6Months = () => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: date.toLocaleDateString('ar-EG', { month: 'short' }),
                monthNum: date.getMonth(),
                year: date.getFullYear()
            });
        }
        return months;
    };

    const monthlyTrend = getLast6Months().map(({ month, monthNum, year }) => {
        const monthDeals = deals.filter(d => {
            const dealDate = new Date(d.created_at);
            return dealDate.getMonth() === monthNum && dealDate.getFullYear() === year;
        });
        const wonDeals = monthDeals.filter(d => d.stage === 'closed_won');
        return {
            month,
            deals: monthDeals.length,
            revenue: wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / 1000,
            won: wonDeals.length
        };
    });

    const exportToCSV = () => {
        const headers = ['العنوان', 'العميل', 'القيمة', 'المرحلة', 'التاريخ'];
        const rows = deals.map(d => [
            d.title,
            d.customer_name,
            d.value,
            d.stage,
            new Date(d.created_at).toLocaleDateString('ar-EG')
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التقارير...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        تقارير المبيعات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">تحليلات شاملة لأداء المبيعات</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="7">آخر 7 أيام</option>
                        <option value="30">آخر 30 يوم</option>
                        <option value="90">آخر 90 يوم</option>
                        <option value="365">آخر سنة</option>
                    </select>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        تصدير CSV
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-500" />
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(metrics.totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي القيمة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {metrics.conversionRate.toFixed(0)}%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metrics.wonDeals}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">صفقات ناجحة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">EGP</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(metrics.avgDealSize / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط قيمة الصفقة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-orange-500" />
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">يوم</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metrics.avgSalesCycle.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">دورة المبيعات</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">الاتجاه الشهري</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="month" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="deals" stroke="#3b82f6" name="الصفقات" strokeWidth={2} />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" name="الإيرادات (K)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Stage Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">توزيع المراحل</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stageDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {stageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">ملخص الأداء</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المقياس</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">القيمة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">إجمالي الصفقات</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{metrics.totalDeals}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                        نشط
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">معدل التحويل</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{metrics.conversionRate.toFixed(1)}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${metrics.conversionRate >= 50
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                        }`}>
                                        {metrics.conversionRate >= 50 ? 'ممتاز' : 'جيد'}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">الصفقات المغلقة</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {metrics.wonDeals + metrics.lostDeals}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-full">
                                        مكتمل
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
