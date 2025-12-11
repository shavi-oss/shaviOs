"use client";

import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Award,
    Target,
    Download,
    PieChart
} from 'lucide-react';

export default function HRAnalyticsPage() {
    const stats = {
        total_employees: 45,
        growth_rate: 12.5,
        turnover_rate: 3.2,
        avg_tenure: '2.8 years',
        total_payroll: 3500000,
        leave_utilization: 68
    };

    const deptDistribution = [
        { name: 'Sales', count: 15, color: 'bg-blue-500' },
        { name: 'Marketing', count: 8, color: 'bg-purple-500' },
        { name: 'Finance', count: 6, color: 'bg-green-500' },
        { name: 'HR', count: 4, color: 'bg-yellow-500' },
        { name: 'Operations', count: 7, color: 'bg-orange-500' },
        { name: 'Customer Success', count: 5, color: 'bg-pink-500' }
    ];

    const employeeGrowth = [
        { month: 'Jul', count: 38 },
        { month: 'Aug', count: 40 },
        { month: 'Sep', count: 41 },
        { month: 'Oct', count: 43 },
        { month: 'Nov', count: 44 },
        { month: 'Dec', count: 45 }
    ];

    const maxGrowth = Math.max(...employeeGrowth.map(m => m.count));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        HR Analytics
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Performance metrics and workforce insights</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Users className="w-5 h-5 text-blue-500 mb-2" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total_employees}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Employees</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                    <div className="text-2xl font-black text-green-600">+{stats.growth_rate}%</div>
                    <div className="text-xs text-gray-500 mt-1">Growth Rate</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Award className="w-5 h-5 text-yellow-500 mb-2" />
                    <div className="text-2xl font-black text-yellow-600">{stats.turnover_rate}%</div>
                    <div className="text-xs text-gray-500 mt-1">Turnover Rate</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Target className="w-5 h-5 text-purple-500 mb-2" />
                    <div className="text-2xl font-black text-purple-600">{stats.avg_tenure}</div>
                    <div className="text-xs text-gray-500 mt-1">Avg Tenure</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <BarChart3 className="w-5 h-5 text-orange-500 mb-2" />
                    <div className="text-2xl font-black text-orange-600">${(stats.total_payroll / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-gray-500 mt-1">Annual Payroll</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <PieChart className="w-5 h-5 text-pink-500 mb-2" />
                    <div className="text-2xl font-black text-pink-600">{stats.leave_utilization}%</div>
                    <div className="text-xs text-gray-500 mt-1">Leave Utilization</div>
                </div>
            </div>

            {/* Employee Growth Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Employee Growth (Last 6 Months)
                </h2>
                <div className="flex items-end justify-between gap-2 h-64">
                    {employeeGrowth.map((data, idx) => {
                        const height = (data.count / maxGrowth) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{data.count}</div>
                                <div
                                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 font-medium">{data.month}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Department Distribution</h2>
                <div className="space-y-4">
                    {deptDistribution.map((dept, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept.name}</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">{dept.count} ({((dept.count / stats.total_employees) * 100).toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-full rounded-full ${dept.color}`}
                                    style={{ width: `${(dept.count / stats.total_employees) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Performance Heatmap (Department vs Month)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-2 px-3 font-bold text-gray-500">Department</th>
                                {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                    <th key={m} className="text-center py-2 px-3 font-bold text-gray-500">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {deptDistribution.map((dept, idx) => (
                                <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                                    <td className="py-2 px-3 font-medium">{dept.name}</td>
                                    {[92, 88, 95, 89, 93, 91].map((score, i) => (
                                        <td key={i} className="text-center py-2 px-3">
                                            <div className={`inline-block px-3 py-1 rounded ${score >= 90 ? 'bg-green-100 text-green-700' :
                                                    score >= 80 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                } font-bold text-xs`}>
                                                {score - (idx === 0 ? 0 : idx * 2)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
