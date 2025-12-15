"use client";

import { useEffect, useState } from 'react';
import { getBudgets, type Budget } from '@/app/actions/finance';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Download,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280', '#ec4899', '#14b8a6'];

export default function FinanceBudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('2025-12'); // Default to current mocked time

    useEffect(() => {
        loadBudgets();
    }, [selectedPeriod]);

    const loadBudgets = async () => {
        try {
            setLoading(true);
            // In a real app, we might check if user wants "current" (dynamic) or specific month
            // Here selectedPeriod 'YYYY-MM' is passed directly
            const data = await getBudgets(selectedPeriod);
            setBudgets(data as Budget[]);
        } catch (err) {
            console.error('Failed to fetch budgets:', err);
            toast.error('فشل في تحميل الميزانية');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalAllocated: budgets.reduce((sum, b) => sum + b.allocated, 0),
        totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
        totalRemaining: budgets.reduce((sum, b) => sum + b.remaining, 0),
        criticalCount: budgets.filter(b => b.status === 'critical').length,
        warningCount: budgets.filter(b => b.status === 'warning').length,
        avgUtilization: budgets.length > 0 ? budgets.reduce((sum, b) => sum + b.percentage, 0) / budgets.length : 0
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'good': return 'جيد';
            case 'warning': return 'تحذير';
            case 'critical': return 'حرج';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    // Prepare chart data
    // Need Arabic names mapping if categories are in English (which they are from initBudgets)
    const nameMap: Record<string, string> = {
        'Salaries': 'الرواتب',
        'Rent': 'الإيجار',
        'Software': 'البرمجيات',
        'Marketing': 'التسويق',
        'Subscriptions': 'الاشتراكات',
        'Logistics': 'لوجستيات',
        'Commissions': 'العمولات',
        'Consulting': 'الاستشارات',
        'Miscellaneous': 'متنوع'
    };

    const chartData = budgets.map(b => ({
        name: nameMap[b.category] || b.category,
        allocated: b.allocated / 1000,
        spent: b.spent / 1000
    }));

    const pieData = budgets.slice(0, 8).map(b => ({ // Limit to top 8 for cleaner pie
        name: nameMap[b.category] || b.category,
        value: b.allocated
    }));

    const exportCSV = () => {
        // Simple CSV export
        // ...
        toast.info('تم بدء التصدير (Mock)');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الميزانية...</p>
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
                        <DollarSign className="w-8 h-8 text-primary" />
                        إدارة الميزانية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة وتحليل الميزانية</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        {/* Mock periods for selection */}
                        <option value="2025-12">ديسمبر 2025 (الحالي)</option>
                        <option value="2025-11">نوفمبر 2025</option>
                        <option value="2025-10">أكتوبر 2025</option>
                    </select>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalAllocated / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">المخصص</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalSpent / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">المنفق</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalRemaining / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">المتبقي</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgUtilization.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط الاستخدام</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.warningCount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">تحذيرات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalCount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">حرجة</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">المخصص مقابل المنفق</h3>
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
                            <Bar dataKey="allocated" fill="#3b82f6" name="المخصص (K)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="spent" fill="#ef4444" name="المنفق (K)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">توزيع الميزانية</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Budget Categories List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">تفاصيل الميزانية</h3>
                <div className="space-y-4">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {nameMap[budget.category] || budget.category}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(budget.status)}`}>
                                        {getStatusIcon(budget.status)}
                                        {getStatusLabel(budget.status)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {budget.spent.toLocaleString('ar-EG')} / {budget.allocated.toLocaleString('ar-EG')} جنيه
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${budget.status === 'critical' ? 'bg-red-500' :
                                            budget.status === 'warning' ? 'bg-orange-500' :
                                                'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    المتبقي: {budget.remaining.toLocaleString('ar-EG')} جنيه
                                </span>
                                <span className={`font-bold ${budget.status === 'critical' ? 'text-red-600 dark:text-red-400' :
                                    budget.status === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-green-600 dark:text-green-400'
                                    }`}>
                                    {budget.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
