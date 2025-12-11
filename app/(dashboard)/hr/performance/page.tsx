"use client";

import { useState } from 'react';
import {
    Award,
    TrendingUp,
    Target,
    Users,
    DollarSign,
    Trophy,
    Star,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import Link from 'next/link';

export default function PerformanceDashboardPage() {
    const [selectedDept, setSelectedDept] = useState('all');

    const deptPerformance = [
        { dept: 'Sales', avg_score: 92, employees: 15, top_performer: 'Ahmed Hassan', trend: 'up' },
        { dept: 'Marketing', avg_score: 88, employees: 8, top_performer: 'Omar Khalid', trend: 'up' },
        { dept: 'Finance', avg_score: 95, employees: 6, top_performer: 'Mohamed Saeed', trend: 'stable' },
        { dept: 'HR', avg_score: 90, employees: 4, top_performer: 'Sarah Mohamed', trend: 'up' },
        { dept: 'Operations', avg_score: 87, employees: 7, top_performer: 'Laila Ibrahim', trend: 'down' },
        { dept: 'Customer Success', avg_score: 91, employees: 5, top_performer: 'Fatima Ali', trend: 'up' }
    ];

    const topPerformers = [
        { rank: 1, name: 'Mohamed Saeed', dept: 'Finance', score: 96, kpis_met: 5, commission: 0 },
        { rank: 2, name: 'Fatima Ali', dept: 'Customer Success', score: 95, kpis_met: 5, commission: 8000 },
        { rank: 3, name: 'Ahmed Hassan', dept: 'Sales', score: 94, kpis_met: 4, commission: 15000 },
        { rank: 4, name: 'Sarah Mohamed', dept: 'HR', score: 93, kpis_met: 5, commission: 0 },
        { rank: 5, name: 'Omar Khalid', dept: 'Marketing', score: 92, kpis_met: 4, commission: 12000 }
    ];

    const kpiAchievements = {
        total_kpis: 150,
        achieved: 128,
        in_progress: 18,
        not_met: 4,
        achievement_rate: 85
    };

    const commissionEligible = [
        { name: 'Ahmed Hassan', dept: 'Sales', kpis_met: 4, commission_amount: 15000, status: 'eligible' },
        { name: 'Omar Khalid', dept: 'Marketing', kpis_met: 4, commission_amount: 12000, status: 'eligible' },
        { name: 'Laila Ibrahim', dept: 'Operations', kpis_met: 3, commission_amount: 8000, status: 'pending' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    Performance Dashboard
                </h1>
                <p className="text-gray-500 text-sm mt-1">Employee and department performance overview</p>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{kpiAchievements.total_kpis}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total KPIs</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{kpiAchievements.achieved}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Achieved</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{kpiAchievements.in_progress}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">In Progress</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{kpiAchievements.not_met}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">Not Met</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{kpiAchievements.achievement_rate}%</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Achievement Rate</div>
                </div>
            </div>

            {/* Top Performers Leaderboard */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    🏆 Top Performers This Month
                </h2>
                <div className="space-y-3">
                    {topPerformers.map((performer) => (
                        <Link
                            key={performer.rank}
                            href={`/hr/employees/${performer.rank}`}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white ${performer.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                        performer.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                            performer.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                                                'bg-gradient-to-br from-blue-400 to-blue-500'
                                    }`}>
                                    #{performer.rank}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{performer.name}</h3>
                                    <p className="text-xs text-gray-500">{performer.dept} • {performer.kpis_met}/5 KPIs Met</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-green-600">{performer.score}</div>
                                <div className="text-xs text-gray-500">Score</div>
                                {performer.commission > 0 && (
                                    <div className="text-xs text-blue-600 font-bold mt-1">${(performer.commission / 1000).toFixed(0)}K Commission</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Department Performance Overview</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deptPerformance.map((dept) => (
                        <div key={dept.dept} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{dept.dept}</h3>
                                    <p className="text-xs text-gray-500">{dept.employees} employees</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${dept.trend === 'up' ? 'bg-green-100 text-green-700' :
                                        dept.trend === 'down' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {dept.trend === 'up' && <ArrowUp className="w-3 h-3 inline" />}
                                    {dept.trend === 'down' && <ArrowDown className="w-3 h-3 inline" />}
                                    {dept.trend}
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Avg Score</span>
                                    <span className="font-black">{dept.avg_score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-full rounded-full ${dept.avg_score >= 90 ? 'bg-green-500' :
                                                dept.avg_score >= 80 ? 'bg-blue-500' :
                                                    'bg-orange-500'
                                            }`}
                                        style={{ width: `${dept.avg_score}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                                <Star className="w-3 h-3 inline text-yellow-500" /> Top: {dept.top_performer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commission Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Commission Eligible Employees
                    </h2>
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                        Notify HR
                    </button>
                </div>
                <div className="space-y-3">
                    {commissionEligible.map((emp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{emp.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{emp.dept} • {emp.kpis_met}/5 KPIs Met</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-green-600">${(emp.commission_amount / 1000).toFixed(0)}K</div>
                                <div className={`text-xs font-bold mt-1 ${emp.status === 'eligible' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {emp.status === 'eligible' ? '✓ Eligible' : '⏳ Pending Approval'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
