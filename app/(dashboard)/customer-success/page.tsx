"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageSquare,
    CheckCircle,
    Clock,
    Users,
    Search,
    AlertCircle,
    BookOpen,
    Zap,
    TrendingUp,
    BarChart2,
    Smile,
    Plus
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

// Mock Data
const TICKET_STATS = [
    { title: "Open Tickets", value: "24", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Avg Resolution", value: "2.4h", icon: Clock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { title: "CSAT Score", value: "4.8/5", icon: Smile, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "SLA Breaches", value: "1", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
];

const WEEKLY_VOLUME = [
    { day: 'Mon', tickets: 12, resolved: 10 },
    { day: 'Tue', tickets: 19, resolved: 15 },
    { day: 'Wed', tickets: 15, resolved: 14 },
    { day: 'Thu', tickets: 22, resolved: 18 },
    { day: 'Fri', tickets: 18, resolved: 16 },
    { day: 'Sat', tickets: 8, resolved: 8 },
    { day: 'Sun', tickets: 5, resolved: 4 },
];

export default function SupportDashboard() {
    const router = useRouter();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        Customer Success Center
                    </h1>
                    <p className="text-gray-500 mt-1">Manage tickets, user satisfaction, and support knowledge.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/customer-success/kb')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Knowledge Base
                    </button>
                    <button onClick={() => router.push('/customer-success/tickets/new')} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg">
                        <Plus className="w-5 h-5" /> New Ticket
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TICKET_STATS.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-gray-500" />
                            Ticket Volume & Resolution
                        </h3>
                        <select className="text-sm border-gray-200 rounded-lg p-1 bg-gray-50">
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={WEEKLY_VOLUME}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Tickets" />
                                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions & Agent Performance */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-300" />
                            Agent Focus
                        </h3>
                        <p className="text-indigo-100 text-sm mb-4">You have 3 high-priority tickets assigned to you that are nearing SLA breach.</p>
                        <button onClick={() => router.push('/customer-success/tickets?filter=assigned_me')} className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                            View My Tickets
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold mb-4">Top Agents</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">Ag</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Sarah Ahmed</span>
                                            <span className="text-green-600">98%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => router.push('/customer-success/tickets')} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <MessageSquare className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">ALL</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">All Tickets</h4>
                    <p className="text-xs text-gray-500">View full history</p>
                </div>
                <div onClick={() => router.push('/customer-success/kb')} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">KB</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Knowledge Base</h4>
                    <p className="text-xs text-gray-500">Manage articles</p>
                </div>
                <div onClick={() => router.push('/customer-success/automations')} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <Zap className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-mono">AUTO</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Automations</h4>
                    <p className="text-xs text-gray-500">Rules & triggers</p>
                </div>
                <div onClick={() => router.push('/customer-success/reports')} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <TrendingUp className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-mono">RPT</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Reports</h4>
                    <p className="text-xs text-gray-500">Deep analytics</p>
                </div>
            </div>
        </div>
    );
}
