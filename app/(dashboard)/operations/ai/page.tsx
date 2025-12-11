"use client";

import { useEffect, useState } from 'react';
import {
    BrainCircuit,
    TrendingUp,
    AlertTriangle,
    Zap,
    BarChart,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function AIStatsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                        <BrainCircuit className="w-8 h-8 text-indigo-600" />
                        AI OPERATIONAL MIND
                    </h1>
                    <p className="text-gray-500 mt-2">Predictive analytics and smart optimization suggestions.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    Model: OPS-GPT-4 (Active)
                </div>
            </div>

            {/* Top Predictions */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-mono opacity-80 border border-white/30 px-2 py-0.5 rounded">High Confidence</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Session Risk Alert</h3>
                    <p className="text-indigo-100 text-sm mb-4">Predicted 65% chance of technology failure in Lab B due to repeated projector overheating reports.</p>
                    <button className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded transition-colors w-full text-center">view details</button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600">+12% vs Avg</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600">Optimization Opportunity</h3>
                    <p className="text-gray-500 text-sm mb-4">Moving "UX Design" to Wednesday 2 PM would increase attendance by approximately 15% based on student traffic data.</p>
                    <button className="text-indigo-600 text-xs font-bold flex items-center gap-1">Apply Suggestion <ChevronRight className="w-3 h-3" /></button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600">Trainer Fatigue Analysis</h3>
                    <p className="text-gray-500 text-sm mb-4">Trainer "Omar Hassan" has 4 back-to-back sessions scheduled for next Monday. Performance dip predicted.</p>
                    <button className="text-indigo-600 text-xs font-bold flex items-center gap-1">Reschedule One Session <ChevronRight className="w-3 h-3" /></button>
                </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                        <BarChart className="w-5 h-5 text-gray-500" />
                        Predicted Incident Volume (Next 7 Days)
                    </h3>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {[12, 18, 45, 22, 15, 8, 5].map((h, i) => (
                            <div key={i} className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative group">
                                <div
                                    className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${h > 30 ? 'bg-red-400' : h > 15 ? 'bg-blue-400' : 'bg-green-400'
                                        }`}
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}% Risk
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2 px-2 font-mono">
                        <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Smart Recommendations
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                            <div>
                                <h4 className="font-bold text-sm">Automate Certification</h4>
                                <p className="text-xs text-gray-500 mt-1">Based on "React Basic" completion rates, enabling auto-certificate generation would save 4 Ops hours/week.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                            <div>
                                <h4 className="font-bold text-sm">Room Re-allocation</h4>
                                <p className="text-xs text-gray-500 mt-1">Lab A is over-booked on Sundays while Lab B is empty. Swap "Intro to Coding" to Lab B.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
