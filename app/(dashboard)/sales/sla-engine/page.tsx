"use client";

import { useState } from 'react';
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    Settings,
    TrendingUp,
    Users,
    Zap,
    Target,
    Edit,
    Save
} from 'lucide-react';

interface SLARule {
    id: string;
    priority: 'hot' | 'warm' | 'cold';
    response_time_minutes: number;
    escalate_after_minutes: number;
    auto_escalate: boolean;
}

interface SLAStats {
    total_deals: number;
    on_time: number;
    at_risk: number;
    breached: number;
    compliance_rate: number;
}

export default function SLAEnginePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [slaRules, setSlaRules] = useState<SLARule[]>([
        { id: '1', priority: 'hot', response_time_minutes: 10, escalate_after_minutes: 5, auto_escalate: true },
        { id: '2', priority: 'warm', response_time_minutes: 60, escalate_after_minutes: 30, auto_escalate: true },
        { id: '3', priority: 'cold', response_time_minutes: 1440, escalate_after_minutes: 720, auto_escalate: false }
    ]);

    const stats: SLAStats = {
        total_deals: 24,
        on_time: 18,
        at_risk: 4,
        breached: 2,
        compliance_rate: 75
    };

    // Mock breach alerts
    const breaches = [
        { id: '1', deal: 'Enterprise License - Tech Corp', priority: 'hot', overdue_by: '15 minutes', agent: 'Sarah Ahmed' },
        { id: '2', deal: 'Renewal Discussion - Big Co', priority: 'hot', overdue_by: '32 minutes', agent: 'Mohamed Ali' },
    ];

    const atRisk = [
        { id: '3', deal: 'New Inquiry - Retail Chain', priority: 'warm', time_left: '8 minutes', agent: 'Fatima Hassan' },
        { id: '4', deal: 'Real Estate Package', priority: 'hot', time_left: '3 minutes', agent: 'Ahmed Saeed' },
        { id: '5', deal: 'Expansion Deal', priority: 'warm', time_left: '12 minutes', agent: 'Laila Mohamed' },
        { id: '6', deal: 'Consulting Project', priority: 'cold', time_left: '4 hours', agent: 'Omar Khalid' },
    ];

    const updateRule = (id: string, field: keyof SLARule, value: any) => {
        setSlaRules(rules =>
            rules.map(rule =>
                rule.id === id ? { ...rule, [field]: value } : rule
            )
        );
    };

    const getPriorityColor = (priority: string) => {
        if (priority === 'hot') return 'bg-red-100 text-red-700 border-red-300';
        if (priority === 'warm') return 'bg-orange-100 text-orange-700 border-orange-300';
        return 'bg-blue-100 text-blue-700 border-blue-300';
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'hot') return '🔥';
        if (priority === 'warm') return '🟡';
        return '❄️';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        SLA Engine
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Sales response time monitoring & auto-escalation</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Settings className="w-4 h-4" /> Configure Rules</>}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total_deals}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Active Deals</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.on_time}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> On Time
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.at_risk}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> At Risk
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.breached}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">Breached</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.compliance_rate}%</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Compliance</div>
                </div>
            </div>

            {/* SLA Rules Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    SLA Rules by Priority
                </h2>

                <div className="space-y-4">
                    {slaRules.map(rule => (
                        <div key={rule.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(rule.priority)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getPriorityIcon(rule.priority)}</span>
                                    <h3 className="font-bold uppercase text-sm">{rule.priority} Priority</h3>
                                </div>
                                {isEditing && (
                                    <Edit className="w-4 h-4 text-gray-400" />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-2">
                                        Response Time
                                    </label>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={rule.response_time_minutes}
                                                onChange={(e) => updateRule(rule.id, 'response_time_minutes', parseInt(e.target.value))}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                                            />
                                            <span className="text-sm">minutes</span>
                                        </div>
                                    ) : (
                                        <div className="text-xl font-black">
                                            {rule.response_time_minutes < 60
                                                ? `${rule.response_time_minutes}m`
                                                : `${Math.floor(rule.response_time_minutes / 60)}h`}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-2">
                                        Escalate After
                                    </label>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={rule.escalate_after_minutes}
                                                onChange={(e) => updateRule(rule.id, 'escalate_after_minutes', parseInt(e.target.value))}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                                            />
                                            <span className="text-sm">minutes</span>
                                        </div>
                                    ) : (
                                        <div className="text-xl font-black">
                                            {rule.escalate_after_minutes < 60
                                                ? `${rule.escalate_after_minutes}m`
                                                : `${Math.floor(rule.escalate_after_minutes / 60)}h`}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-2">
                                        Auto-Escalate
                                    </label>
                                    {isEditing ? (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rule.auto_escalate}
                                                onChange={(e) => updateRule(rule.id, 'auto_escalate', e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium">Enabled</span>
                                        </label>
                                    ) : (
                                        <div className="text-xl font-black">
                                            {rule.auto_escalate ? '✅ Yes' : '❌ No'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <Zap className="w-4 h-4 inline mr-2" />
                        <strong>Auto-Escalation:</strong> When enabled, deals will automatically be reassigned to a manager when the escalation threshold is reached.
                    </div>
                )}
            </div>

            {/* Active Breaches */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Active Breaches ({breaches.length})
                    </h2>
                    {breaches.length > 0 && (
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                            Notify All Managers
                        </button>
                    )}
                </div>

                {breaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active breaches - Great work!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {breaches.map(breach => (
                            <div key={breach.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{breach.deal}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {breach.agent}
                                        </span>
                                        <span className="text-red-600 font-bold">Overdue by {breach.overdue_by}</span>
                                    </div>
                                </div>
                                <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                                    Escalate Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* At Risk Deals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    At Risk ({atRisk.length})
                </h2>

                <div className="space-y-3">
                    {atRisk.map(deal => (
                        <div key={deal.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{deal.deal}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {deal.agent}
                                    </span>
                                    <span className={`font-bold ${deal.time_left.includes('minute') && parseInt(deal.time_left) < 10 ? 'text-red-600' : 'text-orange-600'}`}>
                                        {deal.time_left} left
                                    </span>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors">
                                Send Reminder
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compliance Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    7-Day Compliance Trend
                </h2>

                <div className="flex items-end justify-between gap-2 h-40">
                    {[92, 88, 95, 78, 85, 90, 75].map((rate, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className={`w-full rounded-t-lg transition-all ${rate >= 90 ? 'bg-green-500' : rate >= 80 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ height: `${rate}%` }}
                            ></div>
                            <div className="text-xs font-bold text-gray-500">{rate}%</div>
                            <div className="text-[10px] text-gray-400">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
