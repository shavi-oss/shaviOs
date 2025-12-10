"use client";

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    Download,
    TrendingUp,
    Users,
    Target,
    DollarSign,
    Calendar
} from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
    </div>
);

export default function MarketingAnalyticsPage() {
    const [loading, setLoading] = useState(true);

    // Mock Data (In real app, fetch from Supabase aggregations)
    const trafficData = [
        { name: 'Jan', clicks: 4000, leads: 240 },
        { name: 'Feb', clicks: 3000, leads: 139 },
        { name: 'Mar', clicks: 2000, leads: 980 },
        { name: 'Apr', clicks: 2780, leads: 390 },
        { name: 'May', clicks: 1890, leads: 480 },
        { name: 'Jun', clicks: 2390, leads: 380 },
    ];

    const sourceData = [
        { name: 'Facebook', value: 45 },
        { name: 'Instagram', value: 25 },
        { name: 'Google', value: 20 },
        { name: 'Direct', value: 10 },
    ];

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => setLoading(false), 800);
    }, []);

    const handleExport = () => {
        alert("Downloading PDF Report...");
        // Logic to generate PDF would go here
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">تحليلات التسويق المتقدمة</h1>
                    <p className="text-muted-foreground mt-2">متابعة الأداء، العائد على الاستثمار، وتقارير النمو</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors text-sm"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>آخر 30 يوم</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>تصدير تقرير PDF</span>
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="معدل التحويل (Conversion)"
                    value="3.2%"
                    subtext="مقارنة بالشهر الماضي"
                    icon={Target}
                    trend={12.5}
                />
                <KPICard
                    title="تكلفة العميل (CAC)"
                    value="450 EGP"
                    subtext="تحسن بنسبة 8%"
                    icon={DollarSign}
                    trend={-8.2}
                />
                <KPICard
                    title="إجمالي الزيارات"
                    value="154,000"
                    subtext="منذ بداية الحملة"
                    icon={Users}
                    trend={24.1}
                />
                <KPICard
                    title="العائد على الإعلان (ROAS)"
                    value="14.5x"
                    subtext="عالية الأداء"
                    icon={TrendingUp}
                    trend={5.7}
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Traffic Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">تحليل النقرات والعملاء</h3>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trafficData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="leads" name="Leads" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">نمو الحملات (Campaign Growth)</h3>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trafficData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                                <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
