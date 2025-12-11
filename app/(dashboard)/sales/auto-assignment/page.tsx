"use client";

import { useState } from 'react';
import {
    Users,
    Settings,
    Zap,
    BarChart3,
    Target,
    Award,
    Clock,
    TrendingUp,
    Play,
    Pause,
    Edit,
    Trash2,
    Plus,
    ArrowRight,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface AssignmentRule {
    id: string;
    name: string;
    strategy: 'round_robin' | 'skill' | 'performance' | 'availability' | 'workload';
    active: boolean;
    priority: number;
    conditions?: {
        deal_value_min?: number;
        industry?: string[];
        lead_source?: string[];
    };
}

interface Agent {
    id: string;
    name: string;
    active_deals: number;
    capacity: number;
    skills: string[];
    performance_score: number;
    online: boolean;
}

export default function AutoAssignmentPage() {
    const [rules, setRules] = useState<AssignmentRule[]>([
        {
            id: '1',
            name: 'High-Value Tech Deals',
            strategy: 'skill',
            active: true,
            priority: 1,
            conditions: {
                deal_value_min: 50000,
                industry: ['Technology', 'Software']
            }
        },
        {
            id: '2',
            name: 'Round Robin Default',
            strategy: 'round_robin',
            active: true,
            priority: 99
        },
        {
            id: '3',
            name: 'Top Performers Priority',
            strategy: 'performance',
            active: false,
            priority: 2
        }
    ]);

    const [agents] = useState<Agent[]>([
        { id: '1', name: 'Sarah Ahmed', active_deals: 8, capacity: 15, skills: ['Technology', 'Enterprise'], performance_score: 92, online: true },
        { id: '2', name: 'Mohamed Ali', active_deals: 12, capacity: 15, skills: ['Real Estate', 'Finance'], performance_score: 88, online: true },
        { id: '3', name: 'Fatima Hassan', active_deals: 5, capacity: 10, skills: ['Technology', 'Startups'], performance_score: 95, online: true },
        { id: '4', name: 'Ahmed Saeed', active_deals: 15, capacity: 20, skills: ['Enterprise', 'Government'], performance_score: 85, online: false },
        { id: '5', name: 'Laila Mohamed', active_deals: 3, capacity: 10, skills: ['SMB', 'Retail'], performance_score: 78, online: true },
        { id: '6', name: 'Omar Khalid', active_deals: 10, capacity: 15, skills: ['Technology', 'Finance'], performance_score: 90, online: true }
    ]);

    const toggleRule = (id: string) => {
        setRules(rules.map(rule =>
            rule.id === id ? { ...rule, active: !rule.active } : rule
        ));
    };

    const deleteRule = (id: string) => {
        setRules(rules.filter(rule => rule.id !== id));
    };

    const getStrategyIcon = (strategy: string) => {
        switch (strategy) {
            case 'round_robin': return <ArrowRight className="w-4 h-4" />;
            case 'skill': return <Target className="w-4 h-4" />;
            case 'performance': return <Award className="w-4 h-4" />;
            case 'availability': return <Clock className="w-4 h-4" />;
            case 'workload': return <BarChart3 className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    const getStrategyColor = (strategy: string) => {
        switch (strategy) {
            case 'round_robin': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'skill': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'performance': return 'bg-green-100 text-green-700 border-green-300';
            case 'availability': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'workload': return 'bg-pink-100 text-pink-700 border-pink-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getUtilization = (agent: Agent) => {
        return Math.round((agent.active_deals / agent.capacity) * 100);
    };

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 90) return 'bg-red-500';
        if (utilization >= 70) return 'bg-orange-500';
        if (utilization >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-primary" />
                        Auto-Assignment Engine
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Intelligent lead distribution across your sales team</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Rule
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{agents.filter(a => a.online).length}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Agents Online
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{rules.filter(r => r.active).length}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Active Rules</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">
                        {Math.round(agents.reduce((sum, a) => sum + getUtilization(a), 0) / agents.length)}%
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Avg Load</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">24</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Assigned Today</div>
                </div>
            </div>

            {/* Assignment Rules */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Assignment Rules
                </h2>

                <div className="space-y-3">
                    {rules.sort((a, b) => a.priority - b.priority).map(rule => (
                        <div key={rule.id} className={`p-4 rounded-lg border-2 transition-all ${rule.active ? 'bg-white dark:bg-gray-900 border-primary/50' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${rule.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                            }`}
                                    >
                                        {rule.active ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                    </button>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{rule.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStrategyColor(rule.strategy)}`}>
                                                {getStrategyIcon(rule.strategy)}
                                                <span className="ml-1">{rule.strategy.replace('_', ' ').toUpperCase()}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">Priority: {rule.priority}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <Edit className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteRule(rule.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Rule Conditions */}
                            {rule.conditions && (
                                <div className="pl-12 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    {rule.conditions.deal_value_min && (
                                        <div>💰 Deal Value: ≥ ${rule.conditions.deal_value_min.toLocaleString()}</div>
                                    )}
                                    {rule.conditions.industry && (
                                        <div>🏢 Industries: {rule.conditions.industry.join(', ')}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Rules are processed in priority order. First matching rule assigns the lead.
                </div>
            </div>

            {/* Load Balancer - Agent Capacity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Team Load Balancer
                </h2>

                <div className="space-y-4">
                    {agents.map(agent => {
                        const utilization = getUtilization(agent);
                        return (
                            <div key={agent.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${agent.online ? 'bg-green-500' : 'bg-gray-400'
                                            }`}>
                                            {agent.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {agent.name}
                                                {!agent.online && <span className="text-xs text-gray-500">(Offline)</span>}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Award className="w-3 h-3" /> Score: {agent.performance_score}
                                                </span>
                                                <span>•</span>
                                                <span>Skills: {agent.skills.slice(0, 2).join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-gray-900 dark:text-white">
                                            {agent.active_deals} / {agent.capacity}
                                        </div>
                                        <div className="text-xs text-gray-500">{utilization}% utilized</div>
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${getUtilizationColor(utilization)}`}
                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Auto-Balance Load
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Manual Reassign
                    </button>
                </div>
            </div>

            {/* Strategy Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Assignment Strategies</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-blue-900 dark:text-blue-100">Round Robin</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Distributes leads evenly across all available agents in rotation.</p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-purple-900 dark:text-purple-100">Skill-Based</h3>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Matches leads to agents with relevant industry expertise.</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-green-900 dark:text-green-100">Performance-Based</h3>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">Prioritizes top-performing agents for high-value deals.</p>
                    </div>

                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-pink-600" />
                            <h3 className="font-bold text-pink-900 dark:text-pink-100">Workload-Based</h3>
                        </div>
                        <p className="text-sm text-pink-700 dark:text-pink-300">Assigns to agents with lowest current deal count.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
