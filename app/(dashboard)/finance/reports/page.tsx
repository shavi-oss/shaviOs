"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    Cell,
    Legend
} from 'recharts';
import { Calendar } from 'lucide-react';

export default function FinanceReportsPage() {
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const supabase = createClient();
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: true });

            if (!transactions) return;

            // Process Monthly Data (Income vs Expense)
            const monthMap: Record<string, { name: string, income: number, expense: number }> = {};

            transactions.forEach(t => {
                const date = new Date(t.date);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                if (!monthMap[monthKey]) {
                    monthMap[monthKey] = { name: monthName, income: 0, expense: 0 };
                }

                if (t.type === 'income') {
                    monthMap[monthKey].income += t.amount;
                } else {
                    monthMap[monthKey].expense += t.amount;
                }
            });

            setMonthlyData(Object.values(monthMap));

            // Process Expense Categories
            const catMap: Record<string, number> = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                catMap[t.category] = (catMap[t.category] || 0) + t.amount;
            });

            const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
            setCategoryData(catData);

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">التقارير المالية</h1>
                <p className="text-muted-foreground mt-2">تحليل الإيرادات والمصروفات</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>جاري معالجة البيانات...</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Income vs Expense Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-primary" />
                            الإيرادات مقابل المصروفات (شهرياً)
                        </h3>
                        <div className="h-[300px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => `${value.toLocaleString()} EGP`}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Expense Breakdown Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            توزيع المصروفات حسب الفئة
                        </h3>
                        <div className="h-[300px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} EGP`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
