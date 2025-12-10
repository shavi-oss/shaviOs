"use client";

import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Calendar, Filter, Users, DollarSign, TrendingUp, Download } from 'lucide-react';

// --- Mock Data for Charts ---
const FUNNEL_DATA = [
    { name: 'Leads', value: 120, fill: '#60a5fa' },
    { name: 'Contacted', value: 85, fill: '#818cf8' },
    { name: 'Qualified', value: 60, fill: '#a78bfa' },
    { name: 'Proposal', value: 40, fill: '#c084fc' },
    { name: 'Won', value: 25, fill: '#34d399' },
];

const TREND_DATA = [
    { month: 'Jan', revenue: 40000, target: 35000 },
    { month: 'Feb', revenue: 30000, target: 35000 },
    { month: 'Mar', revenue: 55000, target: 40000 },
    { month: 'Apr', revenue: 48000, target: 40000 },
    { month: 'May', revenue: 65000, target: 45000 },
    { month: 'Jun', revenue: 80000, target: 45000 },
];

const AGENT_DATA = [
    { name: 'Ahmed', sales: 120000, deals: 15 },
    { name: 'Sara', sales: 95000, deals: 12 },
    { name: 'Mohamed', sales: 88000, deals: 10 },
    { name: 'Nour', sales: 60000, deals: 8 },
];

export default function SalesReportsPage() {
    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
                    <p className="text-gray-500 mt-2">Performance analytics and revenue forecasts.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">318,000 EGP</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                        <TrendingUp className="w-3 h-3" /> +12.5% vs last month
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold">28.4%</p>
                    <p className="text-gray-400 text-xs mt-2">Industry avg: 22%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Avg Deal Value</p>
                    <p className="text-2xl font-bold">12,400 EGP</p>
                    <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                        <TrendingUp className="w-3 h-3 rotate-180" /> -2.1% vs last month
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Sales Cycle</p>
                    <p className="text-2xl font-bold">18 Days</p>
                    <p className="text-gray-400 text-xs mt-2">Avg time to close</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold mb-6">Revenue Trend (Actual vs Target)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={TREND_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <RechartsTooltip />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#ef4444" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                                <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeDasharray="5 5" name="Target" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Funnel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold mb-6">Conversion Funnel</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {/* Simple Bar representation of Funnel since Recharts Funnel is tricky in some versions */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={FUNNEL_DATA}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <RechartsTooltip />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {FUNNEL_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold mb-6">Top Agents by Revenue</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={AGENT_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <RechartsTooltip />
                                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (EGP)" barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
