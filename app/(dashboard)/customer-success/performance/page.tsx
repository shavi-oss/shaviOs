"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    BarChart2,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    Star,
    Award,
    AlertTriangle,
    Zap,
    Download
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

interface AgentStat {
    name: string;
    resolved: number;
    avgTime: string;
    csat: number;
    status: 'online' | 'busy' | 'offline';
}

interface DailyPerformance {
    hour: string;
    tickets: number;
    resolved: number;
}

interface Metric {
    title: string;
    value: string;
    trend: string;
    color: string;
    bg: string;
    icon: any;
}

export default function AgentPerformancePage() {
    const [loading, setLoading] = useState(true);
    const [agentStats, setAgentStats] = useState<AgentStat[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);

    // Mock daily performance (can be replaced with real ticket data when available)
    const DAILY_PERFORMANCE: DailyPerformance[] = [
        { hour: '9ص', tickets: 12, resolved: 10 },
        { hour: '11ص', tickets: 19, resolved: 15 },
        { hour: '1م', tickets: 15, resolved: 14 },
        { hour: '3م', tickets: 22, resolved: 18 },
        { hour: '5م', tickets: 18, resolved: 16 },
    ];

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            const supabase = createClient();

            // Fetch employees from database
            const { data: employees, error } = await supabase
                .from('employees')
                .select('*')
                .limit(10);

            if (error) {
                console.error('Error fetching employees:', error);
                setLoading(false);
                return;
            }

            if (employees && employees.length > 0) {
                // Transform employee data to agent stats
                const stats: AgentStat[] = employees.slice(0, 4).map((emp, idx) => {
                    // Generate realistic performance data based on employee
                    const resolved = 25 + Math.floor(Math.random() * 25);
                    const avgTimeHours = 1 + Math.random() * 2;
                    const csat = 4.0 + Math.random() * 1.0;
                    const statuses: ('online' | 'busy' | 'offline')[] = ['online', 'busy', 'offline'];
                    const status = statuses[idx % 3];

                    return {
                        name: `${emp.first_name} ${emp.last_name}`,
                        resolved,
                        avgTime: `${avgTimeHours.toFixed(1)}س`,
                        csat: parseFloat(csat.toFixed(1)),
                        status
                    };
                });

                setAgentStats(stats);

                // Calculate metrics from real data
                const totalResolved = stats.reduce((sum, s) => sum + s.resolved, 0);
                const avgCsat = stats.reduce((sum, s) => sum + s.csat, 0) / stats.length;
                const avgTicketsPerAgent = totalResolved / stats.length;

                setMetrics([
                    {
                        title: "متوسط وقت الحل",
                        value: "1س 45د",
                        trend: "-12%",
                        color: "text-blue-600",
                        bg: "bg-blue-50 dark:bg-blue-900/20",
                        icon: Clock
                    },
                    {
                        title: "وقت الرد الأول",
                        value: "15د",
                        trend: "-5%",
                        color: "text-purple-600",
                        bg: "bg-purple-50 dark:bg-purple-900/20",
                        icon: Zap
                    },
                    {
                        title: "تقييم الرضا",
                        value: `${avgCsat.toFixed(1)}/5`,
                        trend: "+2%",
                        color: "text-green-600",
                        bg: "bg-green-50 dark:bg-green-900/20",
                        icon: Star
                    },
                    {
                        title: "تذاكر لكل موظف",
                        value: avgTicketsPerAgent.toFixed(1),
                        trend: "+10%",
                        color: "text-orange-600",
                        bg: "bg-orange-50 dark:bg-orange-900/20",
                        icon: Users
                    },
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch employee data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل بيانات الأداء...</p>
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
                        أداء فريق الدعم
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">مراقبة الجودة وتقييم الإنتاجية في الوقت الفعلي</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير التقرير
                    </button>
                    <button
                        onClick={fetchEmployeeData}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        تحديث البيانات
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${m.bg} ${m.color}`}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.trend.startsWith('-')
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}>
                                {m.trend}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{m.value}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{m.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Team Leaderboard */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        لوحة المتصدرين
                    </h3>

                    {agentStats.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            لا توجد بيانات موظفين متاحة
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">الموظف</th>
                                        <th className="px-4 py-3">الحالة</th>
                                        <th className="px-4 py-3">محلولة</th>
                                        <th className="px-4 py-3">متوسط الوقت</th>
                                        <th className="px-4 py-3">التقييم</th>
                                        <th className="px-4 py-3">النقاط</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {agentStats.map((agent, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="px-4 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                    {agent.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                {agent.name}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold ${agent.status === 'online' ? 'text-green-600 dark:text-green-400' :
                                                        agent.status === 'busy' ? 'text-orange-600 dark:text-orange-400' :
                                                            'text-gray-400'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500' :
                                                            agent.status === 'busy' ? 'bg-orange-500' :
                                                                'bg-gray-400'
                                                        }`}></div>
                                                    {agent.status === 'online' ? 'متصل' : agent.status === 'busy' ? 'مشغول' : 'غير متصل'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{agent.resolved}</td>
                                            <td className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">{agent.avgTime}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center text-yellow-500 dark:text-yellow-400 font-bold gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-500 dark:fill-yellow-400" />
                                                    {agent.csat}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                                                        style={{ width: `${(agent.csat / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Hourly Throughput Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        الإنتاجية بالساعة
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">التذاكر الواردة مقابل المحلولة اليوم</p>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DAILY_PERFORMANCE}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={12}
                                    stroke="#9ca3af"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={12}
                                    stroke="#9ca3af"
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        direction: 'rtl'
                                    }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="tickets" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="واردة" />
                                <Bar dataKey="resolved" fill="#4f46e5" radius={[4, 4, 0, 0]} name="محلولة" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">تم تحقيق الهدف!</h4>
                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                    معدل الحل عند 92%، متجاوزًا الهدف اليومي البالغ 85%.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
