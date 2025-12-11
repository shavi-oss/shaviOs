"use client";

import {
    BarChart2,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    Star,
    Award,
    AlertTriangle
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
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Mock Data
const AGENT_STATS = [
    { name: 'Sarah Ahmed', resolved: 45, avgTime: '1.2h', csat: 4.9, status: 'online' },
    { name: 'Mohamed Ali', resolved: 38, avgTime: '2.5h', csat: 4.7, status: 'busy' },
    { name: 'Laila Khan', resolved: 42, avgTime: '1.8h', csat: 4.8, status: 'online' },
    { name: 'Omar Youssef', resolved: 28, avgTime: '3.1h', csat: 4.2, status: 'offline' },
];

const DAILY_PERFORMANCE = [
    { hour: '9AM', tickets: 12, resolved: 10 },
    { hour: '11AM', tickets: 19, resolved: 15 },
    { hour: '1PM', tickets: 15, resolved: 14 },
    { hour: '3PM', tickets: 22, resolved: 18 },
    { hour: '5PM', tickets: 18, resolved: 16 },
];

const METRICS = [
    { title: "Avg Resolution Time", value: "1h 45m", trend: "-12%", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
    { title: "First Response Time", value: "15m", trend: "-5%", color: "text-purple-600", bg: "bg-purple-50", icon: Zap },
    { title: "CSAT Score", value: "4.8/5", trend: "+2%", color: "text-green-600", bg: "bg-green-50", icon: Star },
    { title: "Tickets Per Agent", value: "18.5", trend: "+10%", color: "text-orange-600", bg: "bg-orange-50", icon: Users },
];

import { Zap } from 'lucide-react';

export default function AgentPerformancePage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-primary" />
                        Agent Performance Engine
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time quality monitoring and productivity scoring.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600">Export Report</button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Generate Insights</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {METRICS.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${m.bg} ${m.color}`}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.trend.startsWith('-') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {m.trend}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{m.value}</h3>
                        <p className="text-sm text-gray-500 font-medium">{m.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6 h-[500px]">
                {/* Visual Leaderboard */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        Team Leaderboard
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Agent</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Resolved</th>
                                    <th className="px-4 py-3">Avg Time</th>
                                    <th className="px-4 py-3">CSAT</th>
                                    <th className="px-4 py-3">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {AGENT_STATS.map((agent, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                                                {agent.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {agent.name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${agent.status === 'online' ? 'text-green-600' :
                                                    agent.status === 'busy' ? 'text-orange-600' : 'text-gray-400'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500' :
                                                        agent.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                                                    }`}></div>
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-medium">{agent.resolved}</td>
                                        <td className="px-4 py-4 font-medium text-gray-500">{agent.avgTime}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center text-yellow-500 font-bold gap-1">
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                {agent.csat}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-full bg-gray-100 rounded-full h-2 w-24 overflow-hidden">
                                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(agent.csat / 5) * 100}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Efficiency Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        Hourly Throughput
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Tickets In vs Resolved Today</p>

                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DAILY_PERFORMANCE}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="tickets" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Incoming" />
                                <Bar dataKey="resolved" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Resolved" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-green-800 text-sm">Target Met!</h4>
                                <p className="text-xs text-green-700 mt-1">Resolution rate is at 92%, exceeding the daily goal of 85%.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
