"use client";

import { useEffect, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    Shield,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import Link from 'next/link';

// Mock Data for Charts
const HOURLY_TRAFFIC = [
    { hour: '00:00', requests: 120 }, { hour: '04:00', requests: 80 },
    { hour: '08:00', requests: 450 }, { hour: '12:00', requests: 980 },
    { hour: '16:00', requests: 850 }, { hour: '20:00', requests: 340 },
    { hour: '23:59', requests: 190 },
];

const ERROR_RATES = [
    { name: 'Success', value: 98.5, fill: '#10b981' }, // green-500
    { name: 'Error', value: 1.5, fill: '#ef4444' },    // red-500
];

const RECENT_ALERTS = [
    { id: 1, type: 'warning', message: 'High latency detected on Telegram webhook', time: '10 mins ago' },
    { id: 2, type: 'error', message: 'Stripe sync failed: Invalid API Key', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' },
];

export default function TechPanelDashboard() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tech Panel Dashboard</h1>
                    <p className="text-muted-foreground mt-2">System performance and health overview</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        System Operational
                    </span>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Requests (24h)"
                    value="45.2k"
                    trend="+12%"
                    icon={Activity}
                    color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                />
                <MetricCard
                    title="Avg Latency"
                    value="124ms"
                    trend="-5ms"
                    icon={Clock}
                    color="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                />
                <MetricCard
                    title="Error Rate"
                    value="1.2%"
                    trend="+0.1%"
                    trendColor="text-red-500"
                    icon={AlertTriangle}
                    color="text-red-600 bg-red-50 dark:bg-red-900/20"
                />
                <MetricCard
                    title="Active Webhooks"
                    value="12"
                    trend="Stable"
                    icon={Globe}
                    color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Traffic Volume (24h)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={HOURLY_TRAFFIC}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#E60000"
                                    fill="url(#colorRequests)"
                                    strokeWidth={2}
                                />
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E60000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#E60000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sub-Modules Quick Access */}
                <div className="space-y-6">
                    {/* Recent Alerts */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Recent Alerts</h3>
                            <Link href="/tech-panel/logs" className="text-xs text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {RECENT_ALERTS.map(alert => (
                                <div key={alert.id} className="flex gap-3 items-start">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.type === 'error' ? 'bg-red-500' :
                                            alert.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                                        <p className="text-xs text-gray-500">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/tech-panel/webhooks" className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                            <Globe className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">Webhooks</span>
                        </Link>
                        <Link href="/tech-panel/secrets" className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                            <Shield className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">Secrets</span>
                        </Link>
                        <Link href="/tech-panel/integrations" className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                            <Zap className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">Integrations</span>
                        </Link>
                        <Link href="/tech-panel/logs" className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                            <Database className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">System Logs</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, icon: Icon, color, trendColor }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h2>
                {trend && (
                    <span className={`text-xs font-medium ${trendColor || 'text-green-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
