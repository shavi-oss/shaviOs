"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Phone,
    Mail,
    MessageSquare,
    Calendar,
    FileText,
    ArrowRight,
    Clock,
    CheckCircle,
    XCircle,
    Building2,
    User,
    MapPin,
    Globe,
    Tag,
    Star,
    TrendingUp,
    Zap,
    Brain,
    Target,
    AlertCircle,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function DealWorkstationPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
    const [newNote, setNewNote] = useState('');

    // Mock data
    const deal = {
        id,
        title: 'Enterprise License Deal',
        company: 'Tech Corp International',
        value: 50000,
        stage: 'Proposal',
        priority: 'hot',
        lead_score: 85,
        win_probability: 72,
        contact: {
            name: 'Ahmed Hassan',
            title: 'CTO',
            email: 'ahmed@techcorp.com',
            phone: '+20 123 456 789',
            location: 'Cairo, Egypt'
        },
        company_info: {
            industry: 'Technology',
            size: '50-200 employees',
            website: 'techcorp.com',
            revenue: '$5M-$10M'
        },
        tags: ['Enterprise', 'Hot Lead', 'Tech Sector'],
        activities: [
            { id: '1', type: 'email', actor: 'You', action: 'Sent proposal', time: '2 hours ago' },
            { id: '2', type: 'call', actor: 'Ahmed Hassan', action: 'Requested pricing call', time: '1 day ago' },
            { id: '3', type: 'meeting', actor: 'You', action: 'Demo completed', time: '3 days ago' },
            { id: '4', type: 'note', actor: 'You', action: 'Very interested in enterprise features', time: '3 days ago' }
        ],
        tasks: [
            { id: '1', title: 'Follow up on proposal', done: false, due: 'Today' },
            { id: '2', title: 'Send technical documentation', done: false, due: 'Tomorrow' },
            { id: '3', title: 'Schedule pricing call', done: true, due: 'Yesterday' }
        ],
        ai_insights: [
            { type: 'tip', text: 'High engagement detected. Recommend follow-up within 24 hours.' },
            { type: 'warning', text: 'Competitor mentioned in last call. Address competitive advantages.' },
            { type: 'opportunity', text: 'Budget cycle ends this month. Perfect timing to close.' }
        ],
        sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };

    const getSLAcolor = (due: Date) => {
        const diff = due.getTime() - Date.now();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 1) return 'text-red-600 bg-red-50 border-red-200';
        if (hours < 4) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getSLAtext = (due: Date) => {
        const diff = due.getTime() - Date.now();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900">
            {/* Left Panel - Contact Info */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0">
                <div className="p-6">
                    {/* Contact Header */}
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-3">
                            {deal.contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{deal.contact.name}</h2>
                        <p className="text-sm text-gray-500">{deal.contact.title}</p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${deal.contact.email}`} className="text-blue-600 hover:underline">{deal.contact.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${deal.contact.phone}`} className="text-gray-700 dark:text-gray-300">{deal.contact.phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{deal.contact.location}</span>
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Building2 className="w-3 h-3" /> Company
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Industry</span>
                                <span className="font-medium text-gray-900 dark:text-white">{deal.company_info.industry}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Size</span>
                                <span className="font-medium text-gray-900 dark:text-white">{deal.company_info.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Revenue</span>
                                <span className="font-medium text-gray-900 dark:text-white">{deal.company_info.revenue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <a href={`https://${deal.company_info.website}`} target="_blank" className="text-blue-600 hover:underline">{deal.company_info.website}</a>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {deal.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {tag}
                                </span>
                            ))}
                            <button className="px-2 py-1 border-2 border-dashed border-gray-300 text-gray-400 text-xs font-bold rounded-full hover:border-blue-500 hover:text-blue-500 transition-colors">
                                <Plus className="w-3 h-3 inline" /> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Panel - Activity & Actions */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Link href="/sales/pipeline" className="text-gray-400 hover:text-gray-600 text-sm">← Back to Pipeline</Link>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{deal.title}</h1>
                            <p className="text-gray-500">{deal.company}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-green-600">${deal.value.toLocaleString()}</div>
                            <div className="text-sm text-gray-500 mt-1">{deal.stage}</div>
                        </div>
                    </div>

                    {/* Smart Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <Phone className="w-4 h-4" /> Call Now
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <MessageSquare className="w-4 h-4" /> WhatsApp
                        </button>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <Mail className="w-4 h-4" /> Email
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <Calendar className="w-4 h-4" /> Book Meeting
                        </button>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <FileText className="w-4 h-4" /> Send Offer
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <ArrowRight className="w-4 h-4" /> Next Stage
                        </button>
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <Clock className="w-4 h-4" /> Follow-up
                        </button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <CheckCircle className="w-4 h-4" /> Mark Won
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 flex items-center justify-center gap-2 transition-all hover:scale-105">
                            <XCircle className="w-4 h-4" /> Mark Lost
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800 px-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'activity' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Activity
                            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'notes' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Notes
                            {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'tasks' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Tasks ({deal.tasks.filter(t => !t.done).length})
                            {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            {deal.activities.map(activity => (
                                <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'call' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-gray-100 text-gray-600'
                                        }`}>
                                        {activity.type === 'email' && <Mail className="w-5 h-5" />}
                                        {activity.type === 'call' && <Phone className="w-5 h-5" />}
                                        {activity.type === 'meeting' && <Calendar className="w-5 h-5" />}
                                        {activity.type === 'note' && <FileText className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            <span className="font-bold">{activity.actor}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                                />
                                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                                    Add Note
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-3">
                            {deal.tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group">
                                    <input
                                        type="checkbox"
                                        checked={task.done}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-gray-500">Due: {task.due}</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Task
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Intelligence */}
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0">
                <div className="p-6">
                    {/* SLA Timer */}
                    <div className={`p-4 rounded-lg border mb-6 ${getSLAcolor(deal.sla_due_at)}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase">Response SLA</span>
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black">{getSLAtext(deal.sla_due_at)}</div>
                    </div>

                    {/* Lead Score */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Lead Score</h3>
                            <span className="text-2xl font-black text-primary">{deal.lead_score}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all"
                                style={{ width: `${deal.lead_score}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Score out of 100</p>
                    </div>

                    {/* Win Probability */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Win Probability</h3>
                            <span className="text-2xl font-black text-green-600">{deal.win_probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all"
                                style={{ width: `${deal.win_probability}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Based on historical data</p>
                    </div>

                    {/* AI Insights */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4" /> AI Insights
                        </h3>
                        <div className="space-y-3">
                            {deal.ai_insights.map((insight, i) => (
                                <div key={i} className={`p-3 rounded-lg text-xs ${insight.type === 'tip' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
                                        insight.type === 'warning' ? 'bg-orange-50 border border-orange-200 text-orange-700' :
                                            'bg-green-50 border border-green-200 text-green-700'
                                    }`}>
                                    <div className="flex gap-2">
                                        {insight.type === 'tip' && <Zap className="w-4 h-4 shrink-0" />}
                                        {insight.type === 'warning' && <AlertCircle className="w-4 h-4 shrink-0" />}
                                        {insight.type === 'opportunity' && <Target className="w-4 h-4 shrink-0" />}
                                        <p className="font-medium leading-relaxed">{insight.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
