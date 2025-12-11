"use client";

import { useState } from 'react';
import {
    TrendingUp,
    BarChart3,
    Target,
    DollarSign,
    Clock,
    Users,
    Award,
    Phone,
    Mail,
    Calendar
} from 'lucide-react';

export default function SalesAnalyticsPage() {
    const metrics = {
        conversion_rate: 68,
        avg_deal_size: 35000,
        sales_cycle_days: 24,
        avg_response_time: '12m',
        total_activities: 486,
        pipeline_velocity: '+15%'
    };

    const dealsByStage = [
        { name: 'New', count: 42, value: 850000 },
        { name: 'Contacted', count: 35, value: 720000 },
        { name: 'Qualified', count: 28, value: 980000 },
        { name: 'Proposal', count: 18, value: 1200000 },
        { name: 'Negotiation', count: 12, value: 890000 },
        { name: 'Won', count: 24, value: 1650000 }
    ];

    const revenueData = [
        { month: 'Jan', revenue: 125000 },
        { month: 'Feb', revenue: 145000 },
        { month: 'Mar', revenue: 168000 },
        { month: 'Apr', revenue: 152000 },
        { month: 'May', revenue: 195000 },
        { month: 'Jun', revenue: 220000 }
    ];

    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Sales Analytics
                </h1>
                <p className="text-gray-500 text-sm mt-1">Performance metrics and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-green-600 font-bold">+5%</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.conversion_rate}%</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Conversion Rate</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                        <span className="text-xs text-blue-600 font-bold">+12%</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">${(metrics.avg_deal_size / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Avg Deal Size</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-xs text-orange-600 font-bold">-3d</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.sales_cycle_days}d</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Sales Cycle</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span className="text-xs text-purple-600 font-bold">{metrics.pipeline_velocity}</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.avg_response_time}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Response Time</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-pink-500" />
                        <span className="text-xs text-pink-600 font-bold">+18</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.total_activities}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Activities</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="text-xs text-yellow-600 font-bold">Top 10%</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">92</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Team Score</div>
                </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenue Trend (6 Months)
                </h2>
                <div className="flex items-end justify-between gap-2 h-64">
                    {revenueData.map((data, idx) => {
                        const height = (data.revenue / maxRevenue) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="text-xs font-bold text-gray-900 dark:text-white">${(data.revenue / 1000).toFixed(0)}K</div>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 font-medium">{data.month}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pipeline by Stage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Pipeline by Stage
                </h2>
                <div className="space-y-4">
                    {dealsByStage.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-32 font-bold text-sm text-gray-700 dark:text-gray-300">{stage.name}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full ${idx === 0 ? 'bg-gray-500' :
                                                    idx === 1 ? 'bg-blue-500' :
                                                        idx === 2 ? 'bg-purple-500' :
                                                            idx === 3 ? 'bg-orange-500' :
                                                                idx === 4 ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                }`}
                                            style={{ width: `${(stage.value / 1650000) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{stage.count} deals</span>
                                    <span className="font-bold">${(stage.value / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Activity Breakdown (This Week)</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                            <Phone className="w-6 h-6 text-blue-600" />
                            <span className="text-2xl font-black text-blue-600">182</span>
                        </div>
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Calls Made</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Avg 30/day</div>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                            <Mail className="w-6 h-6 text-purple-600" />
                            <span className="text-2xl font-black text-purple-600">245</span>
                        </div>
                        <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Emails Sent</div>
                        <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">Avg 41/day</div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar className="w-6 h-6 text-green-600" />
                            <span className="text-2xl font-black text-green-600">59</span>
                        </div>
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">Meetings Booked</div>
                        <div className="text-xs text-green-700 dark:text-green-300 mt-1">Avg 10/day</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
