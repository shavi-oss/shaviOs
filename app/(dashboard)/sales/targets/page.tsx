"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Target,
    Trophy,
    TrendingUp,
    Calendar,
    Award
} from 'lucide-react';

interface SalesGoal {
    id: string;
    target_amount: number;
    current_amount: number | null;
    start_date: string;
    end_date: string;
    period: string;
    user_id?: string | null;
}

export default function SalesTargetsPage() {
    const [goal, setGoal] = useState<SalesGoal | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        // Fetch the mock goal we inserted in migration, or user specific one
        const supabase = createClient();
        const { data } = await supabase.from('sales_goals').select('*').limit(1).single();
        if (data) setGoal(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading targets...</div>;

    const progress = goal ? Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100) : 0;
    const remaining = goal ? goal.target_amount - (goal.current_amount || 0) : 0;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Target className="w-8 h-8 text-red-600" />
                أهداف المبيعات (Targets)
            </h1>

            {!goal ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-dashed border-gray-300">
                    <p className="text-gray-500">No active goals found for this period.</p>
                    <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Set New Target</button>
                </div>
            ) : (
                <>
                    {/* Main Progress Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

                        <div className="p-8">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">THIS {goal.period.toUpperCase()}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                                            {(goal.current_amount || 0).toLocaleString()}
                                        </span>
                                        <span className="text-gray-400 font-medium">
                                            / {goal.target_amount.toLocaleString()} EGP
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2 w-fit ml-auto">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-bold">{progress.toFixed(1)}% Achieved</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {remaining > 0 ? `${remaining.toLocaleString()} EGP to go!` : 'Target Smashed! 🎉'}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute top-0 bottom-0 right-0 w-20 bg-white/20 skew-x-12 animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className="p-4 bg-yellow-100 rounded-full">
                                <Trophy className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Potential Bonus</p>
                                <p className="text-xl font-bold">5,000 EGP</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-full">
                                <Calendar className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Days Left</p>
                                <p className="text-xl font-bold text-red-500">12 Days</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className="p-4 bg-purple-100 rounded-full">
                                <Award className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Team Rank</p>
                                <p className="text-xl font-bold">#2</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
