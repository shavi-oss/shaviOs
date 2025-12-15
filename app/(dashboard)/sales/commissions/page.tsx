"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    DollarSign,
    TrendingUp,
    Users,
    Award,
    Calendar,
    Download,
    Eye,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Commission {
    id: string;
    employee_name: string;
    employee_id: string;
    total_sales: number;
    commission_rate: number;
    commission_amount: number;
    deals_count: number;
    status: 'pending' | 'approved' | 'paid';
    period: string;
}

export default function CommissionTrackingPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('current');

    useEffect(() => {
        fetchCommissions();
    }, [selectedPeriod]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: employees } = await supabase
                .from('employees')
                .select('*')
                .eq('department', 'sales')
                .limit(15);

            // Generate mock commissions
            const currentMonth = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
            const mockCommissions: Commission[] = (employees || []).map((emp, idx) => {
                const totalSales = 50000 + (idx * 15000) + Math.floor(Math.random() * 30000);
                const commissionRate = 5 + (idx % 3) * 2.5; // 5%, 7.5%, 10%
                const commissionAmount = (totalSales * commissionRate) / 100;
                const dealsCount = 3 + Math.floor(Math.random() * 8);
                const statuses: Array<'pending' | 'approved' | 'paid'> = ['pending', 'approved', 'paid'];

                return {
                    id: `comm-${idx + 1}`,
                    employee_name: `${emp.first_name} ${emp.last_name}`,
                    employee_id: emp.id,
                    total_sales: totalSales,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    deals_count: dealsCount,
                    status: statuses[idx % 3],
                    period: currentMonth
                };
            });

            setCommissions(mockCommissions);
        } catch (err) {
            console.error('Failed to fetch commissions:', err);
            setCommissions([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalCommissions: commissions.reduce((sum, c) => sum + c.commission_amount, 0),
        totalSales: commissions.reduce((sum, c) => sum + c.total_sales, 0),
        pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0),
        paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0),
        salesReps: commissions.length,
        avgCommission: commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.commission_amount, 0) / commissions.length : 0
    };

    const chartData = commissions.slice(0, 10).map(c => ({
        name: c.employee_name.split(' ')[0],
        commission: c.commission_amount / 1000,
        sales: c.total_sales / 1000
    }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'مدفوعة';
            case 'approved': return 'موافق عليها';
            default: return 'قيد المراجعة';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل العمولات...</p>
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
                        <Award className="w-8 h-8 text-primary" />
                        تتبع العمولات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة عمولات فريق المبيعات</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="current">الشهر الحالي</option>
                        <option value="last">الشهر الماضي</option>
                        <option value="quarter">الربع الحالي</option>
                    </select>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalCommissions / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي العمولات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalSales / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي المبيعات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.pending / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">قيد المراجعة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.paid / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مدفوعة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.salesReps}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مندوب مبيعات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.avgCommission / 1000).toFixed(1)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط العمولة</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">أفضل مندوبي المبيعات</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Bar dataKey="commission" fill="#10b981" name="العمولة (K)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sales" fill="#3b82f6" name="المبيعات (K)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Commissions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المندوب</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المبيعات</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">عدد الصفقات</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">نسبة العمولة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العمولة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {commissions.map((commission) => (
                                <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {commission.employee_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {commission.total_sales.toLocaleString('ar-EG')} جنيه
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {commission.deals_count} صفقة
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {commission.commission_rate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {commission.commission_amount.toLocaleString('ar-EG')} جنيه
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(commission.status)}`}>
                                            {getStatusLabel(commission.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
