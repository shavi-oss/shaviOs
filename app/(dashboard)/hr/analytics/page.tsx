"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Award,
    Calendar,
    DollarSign,
    UserCheck,
    UserX,
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

interface EmployeeMetrics {
    totalEmployees: number;
    activeEmployees: number;
    newHires: number;
    turnoverRate: number;
    avgTenure: number;
    departmentBreakdown: { name: string; count: number }[];
    positionBreakdown: { name: string; count: number }[];
    monthlyTrend: { month: string; hires: number; exits: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];

export default function HRAnalyticsPage() {
    const [metrics, setMetrics] = useState<EmployeeMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: employees, error } = await supabase
                .from('employees')
                .select('*');

            if (error) {
                console.error('Error fetching employees:', error);
                setMetrics(null);
            } else {
                const employeeData = employees || [];

                // Calculate metrics
                const totalEmployees = employeeData.length;
                const activeEmployees = employeeData.filter(e => e.status === 'active').length;

                // Mock new hires (last 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const newHires = employeeData.filter(e =>
                    new Date(e.created_at) > thirtyDaysAgo
                ).length;

                // Department breakdown
                const deptCounts: Record<string, number> = {};
                employeeData.forEach(emp => {
                    const dept = emp.department || 'غير محدد';
                    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                });
                const departmentBreakdown = Object.entries(deptCounts).map(([name, count]) => ({
                    name,
                    count
                }));

                // Position breakdown
                const posCounts: Record<string, number> = {};
                employeeData.forEach(emp => {
                    const pos = emp.position || 'غير محدد';
                    posCounts[pos] = (posCounts[pos] || 0) + 1;
                });
                const positionBreakdown = Object.entries(posCounts).map(([name, count]) => ({
                    name,
                    count
                })).slice(0, 5);

                // Monthly trend (mock data)
                const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - (5 - i));
                    return {
                        month: date.toLocaleDateString('ar-EG', { month: 'short' }),
                        hires: Math.floor(Math.random() * 5) + 1,
                        exits: Math.floor(Math.random() * 3)
                    };
                });

                setMetrics({
                    totalEmployees,
                    activeEmployees,
                    newHires,
                    turnoverRate: 5.2, // Mock
                    avgTenure: 2.5, // Mock years
                    departmentBreakdown,
                    positionBreakdown,
                    monthlyTrend
                });
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setMetrics(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التحليلات...</p>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    فشل تحميل البيانات
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
                        <BarChart3 className="w-8 h-8 text-primary" />
                        تحليلات الموارد البشرية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">تحليلات شاملة للموظفين والأداء</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalEmployees}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي الموظفين</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <UserCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeEmployees}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">موظف نشط</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.newHires}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">تعيينات جديدة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.turnoverRate}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل الدوران</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.avgTenure}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط الخدمة (سنة)</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">الاتجاه الشهري</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics.monthlyTrend}>
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
                            <Line type="monotone" dataKey="hires" stroke="#10b981" name="تعيينات" strokeWidth={2} />
                            <Line type="monotone" dataKey="exits" stroke="#ef4444" name="مغادرات" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">توزيع الأقسام</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={metrics.departmentBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {metrics.departmentBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Position Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">أكثر المناصب شيوعًا</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.positionBreakdown}>
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
                        <Bar dataKey="count" fill="#3b82f6" name="عدد الموظفين" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{metrics.activeEmployees}</div>
                            <div className="text-sm opacity-90">موظف نشط</div>
                        </div>
                    </div>
                    <div className="text-sm opacity-90">
                        {((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(0)}% من إجمالي الموظفين
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{metrics.newHires}</div>
                            <div className="text-sm opacity-90">تعيين جديد</div>
                        </div>
                    </div>
                    <div className="text-sm opacity-90">
                        خلال آخر 30 يوم
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Award className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{metrics.avgTenure}</div>
                            <div className="text-sm opacity-90">سنة</div>
                        </div>
                    </div>
                    <div className="text-sm opacity-90">
                        متوسط مدة الخدمة
                    </div>
                </div>
            </div>
        </div>
    );
}
