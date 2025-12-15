"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    TrendingUp,
    Target,
    DollarSign,
    Calendar,
    BarChart3,
    Download
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface ForecastData {
    month: string;
    actual: number;
    forecast: number;
    target: number;
}

export default function SalesForecastingPage() {
    const [forecasts, setForecasts] = useState<ForecastData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecasts();
    }, []);

    const fetchForecasts = async () => {
        try {
            setLoading(true);

            // Generate mock forecast data
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'];
            const mockForecasts: ForecastData[] = months.map((month, idx) => {
                const baseValue = 100000 + (idx * 15000);
                const actual = idx < 5 ? baseValue + (Math.random() * 20000 - 10000) : 0;
                const forecast = baseValue + (idx * 5000) + (Math.random() * 10000);
                const target = baseValue + 20000;

                return {
                    month,
                    actual: idx < 5 ? Math.floor(actual) : 0,
                    forecast: Math.floor(forecast),
                    target: Math.floor(target)
                };
            });

            setForecasts(mockForecasts);
        } catch (err) {
            console.error('Failed to fetch forecasts:', err);
            setForecasts([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        currentMonth: forecasts[4]?.forecast || 0,
        nextMonth: forecasts[5]?.forecast || 0,
        quarterForecast: forecasts.slice(5, 8).reduce((sum, f) => sum + f.forecast, 0),
        accuracy: 92.5,
        growth: 15.3
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التوقعات...</p>
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
                        <TrendingUp className="w-8 h-8 text-primary" />
                        توقعات المبيعات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">تحليل وتوقع اتجاهات المبيعات</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير التقرير
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.currentMonth / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">الشهر الحالي</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.nextMonth / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">الشهر القادم</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.quarterForecast / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">توقعات الربع</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">دقة التوقعات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">+{stats.growth}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل النمو</div>
                </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">توقعات المبيعات الشهرية</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={forecasts}>
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
                        <Line type="monotone" dataKey="actual" stroke="#10b981" name="الفعلي" strokeWidth={2} />
                        <Line type="monotone" dataKey="forecast" stroke="#3b82f6" name="التوقع" strokeWidth={2} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="target" stroke="#f59e0b" name="الهدف" strokeWidth={2} strokeDasharray="3 3" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">مقارنة الأداء</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={forecasts.slice(0, 5)}>
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
                        <Bar dataKey="actual" fill="#10b981" name="الفعلي" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" fill="#f59e0b" name="الهدف" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Forecast Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الشهر</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الفعلي</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التوقع</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الهدف</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الفرق</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {forecasts.map((forecast, idx) => {
                                const diff = forecast.actual > 0 ? forecast.actual - forecast.target : forecast.forecast - forecast.target;
                                const diffPercent = forecast.target > 0 ? (diff / forecast.target) * 100 : 0;

                                return (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {forecast.month}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {forecast.actual > 0 ? `${forecast.actual.toLocaleString('ar-EG')} جنيه` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {forecast.forecast.toLocaleString('ar-EG')} جنيه
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {forecast.target.toLocaleString('ar-EG')} جنيه
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {diff >= 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
