"use client";

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Star, TrendingUp, AlertTriangle, CheckCircle, MessageSquare, ThumbsDown, Users } from 'lucide-react';

// Mock Data for Heatmap
const INSTRUCTOR_HEATMAP = [
    { name: 'Omar H.', clarity: 4.8, punctuality: 4.9, materials: 4.5, interaction: 4.7 },
    { name: 'Sarah A.', clarity: 4.9, punctuality: 4.8, materials: 4.9, interaction: 4.8 },
    { name: 'Ahmed K.', clarity: 3.2, punctuality: 2.5, materials: 3.8, interaction: 3.5 }, // Problematic
    { name: 'Nour M.', clarity: 4.5, punctuality: 4.6, materials: 4.4, interaction: 4.6 },
];

const getColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800 font-bold';
};

export default function QualityPage() {
    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">جودة التعليم (System QMS)</h1>
                    <p className="text-gray-500 mt-2">Comprehensive 360° Quality Management System.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="System NPS" value="72" icon={TrendingUp} description="Excellent" trend={{ value: 5, isPositive: true }} />
                <StatCard title="Avg Instructor Rating" value="4.6/5" icon={Star} description="Above Target" />
                <StatCard title="Active Complaints" value="3" icon={ThumbsDown} description="Requires Action" trend={{ value: 2, isPositive: false }} />
                <StatCard title="Attendance Rate" value="94%" icon={Users} description="Weekly Avg" />
            </div>

            {/* HEATMAP SECTION */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Instructor Performance Heatmap
                    </h3>
                    <p className="text-sm text-gray-500">Live scoring based on student feedback criteria.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-xs font-bold uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Instructor</th>
                                <th className="px-6 py-4 text-center">Clarity</th>
                                <th className="px-6 py-4 text-center">Punctuality</th>
                                <th className="px-6 py-4 text-center">Materials</th>
                                <th className="px-6 py-4 text-center">Interaction</th>
                                <th className="px-6 py-4 text-center bg-gray-100 dark:bg-gray-800">Overall</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {INSTRUCTOR_HEATMAP.map(inst => {
                                const avg = (inst.clarity + inst.punctuality + inst.materials + inst.interaction) / 4;
                                return (
                                    <tr key={inst.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{inst.name}</td>
                                        <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded ${getColor(inst.clarity)}`}>{inst.clarity}</span></td>
                                        <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded ${getColor(inst.punctuality)}`}>{inst.punctuality}</span></td>
                                        <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded ${getColor(inst.materials)}`}>{inst.materials}</span></td>
                                        <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded ${getColor(inst.interaction)}`}>{inst.interaction}</span></td>
                                        <td className="px-6 py-4 text-center font-bold bg-gray-50 dark:bg-gray-800/50">
                                            <span className={`px-2 py-1 rounded shadow-sm ${getColor(avg)}`}>{avg.toFixed(1)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Complaints */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Complaints
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-red-900 dark:text-red-200 text-sm">Instructor Late &gt; 20 mins</span>
                                <span className="text-xs text-red-500">Today</span>
                            </div>
                            <p className="text-xs text-red-700 dark:text-red-300">"Ahmed K. kept us waiting for 25 minutes without notice."</p>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-yellow-900 dark:text-yellow-200 text-sm">Audio Issues</span>
                                <span className="text-xs text-yellow-500">Yesterday</span>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">"Zoom audio was cutting out in Lab B constantly."</p>
                        </div>
                    </div>
                </div>

                {/* Positive Highlights */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        Kudos & Highlights
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-green-900 dark:text-green-200 text-sm">Amazing Explanation</span>
                                <span className="text-xs text-green-500">React Course</span>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-300">"Sarah explains hooks better than any tutorial I've seen!"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
