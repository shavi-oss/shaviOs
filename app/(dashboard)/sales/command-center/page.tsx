"use client";

import { useState } from 'react';
import {
    Users,
    TrendingUp,
    Award,
    AlertTriangle,
    BarChart3,
    Clock,
    Target,
    Zap,
    DollarSign,
    CheckCircle,
    XCircle,
    ArrowUpRight
} from 'lucide-react';

export default function CommandCenterPage() {
    const teamStats = {
        total_agents: 20,
        active_now: 16,
        deals_in_progress: 142,
        total_pipeline: 2500000,
        avg_response_time: '12 minutes',
        sla_compliance: 89
    };

    const topPerformers = [
        { name: 'Fatima Hassan', deals_won: 24, revenue: 450000, win_rate: 95 },
        { name: 'Omar Khalid', deals_won: 21, revenue: 380000, win_rate: 90 },
        { name: 'Sarah Ahmed', deals_won: 19, revenue: 420000, win_rate: 88 }
    ];

    const bottlenecks = [
        { stage: 'Proposal', deals: 28, avg_days: 12, issue: 'Legal review delays' },
        { stage: 'Negotiation', deals: 15, avg_days: 18, issue: 'Pricing approvals slow' }
    ];

    const agentOverview = [
        { name: 'Sarah Ahmed', deals: 12, hot: 3, overdue: 1, utilization: 80 },
        { name: 'Mohamed Ali', deals: 15, hot: 5, overdue: 2, utilization: 100 },
        { name: 'Fatima Hassan', deals: 8, hot: 2, overdue: 0, utilization: 53 },
        { name: 'Ahmed Saeed', deals: 18, hot: 4, overdue: 3, utilization: 90 },
        { name: 'Laila Mohamed', deals: 6, hot: 1, overdue: 0, utilization: 40 },
        { name: 'Omar Khalid', deals: 13, hot: 3, overdue: 1, utilization: 87 }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Manager Command Center
                </h1>
                <p className="text-gray-500 text-sm mt-1">Real-time team oversight and performance monitoring</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{teamStats.total_agents}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Agents</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{teamStats.active_now}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Active Now</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{teamStats.deals_in_progress}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">In Progress</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">${(teamStats.total_pipeline / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Pipeline</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{teamStats.avg_response_time}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Avg Response</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{teamStats.sla_compliance}%</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">SLA Compliance</div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    🏆 Top Performers This Month
                </h2>
                <div className="space-y-3">
                    {topPerformers.map((performer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center font-black text-lg">
                                    #{idx + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{performer.name}</h3>
                                    <p className="text-xs text-gray-500">{performer.deals_won} deals won • ${(performer.revenue / 1000).toFixed(0)}K revenue</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-green-600">{performer.win_rate}%</div>
                                <div className="text-xs text-gray-500">Win Rate</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Team Overview
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Agent</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Deals</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Hot</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Overdue</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agentOverview.map((agent, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{agent.name}</td>
                                    <td className="py-3 px-4 text-center font-bold">{agent.deals}</td>
                                    <td className="py-3 px-4 text-center">
                                        {agent.hot > 0 && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                {agent.hot}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {agent.overdue > 0 && (
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                {agent.overdue}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-full rounded-full ${agent.utilization >= 90 ? 'bg-red-500' : agent.utilization >= 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                    style={{ width: `${agent.utilization}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold w-10 text-right">{agent.utilization}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottlenecks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Pipeline Bottlenecks
                </h2>
                <div className="space-y-3">
                    {bottlenecks.map((bottleneck, idx) => (
                        <div key={idx} className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{bottleneck.stage}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bottleneck.issue}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-orange-600">{bottleneck.deals}</div>
                                    <div className="text-xs text-gray-500">{bottleneck.avg_days} days avg</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
