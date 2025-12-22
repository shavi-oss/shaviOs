"use client";

import { useState } from 'react';
import {
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    FileText,
    Clock,
    Send,
    Plus,
    Search,
    Edit,
    Trash2
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    category: 'email' | 'whatsapp' | 'call';
    content: string;
    usage_count: number;
}

export default function CommunicationHubPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'scheduler' | 'log'>('templates');
    const [searchQuery, setSearchQuery] = useState('');

    const templates: Template[] = [
        { id: '1', name: 'Initial Contact', category: 'email', content: 'Hi [Name], Thank you for your interest in our services...', usage_count: 142 },
        { id: '2', name: 'Follow-up After Demo', category: 'email', content: 'Hope you enjoyed the demo! Here are the next steps...', usage_count: 98 },
        { id: '3', name: 'Pricing Discussion', category: 'whatsapp', content: 'Hi! Here\'s the custom pricing for your business...', usage_count: 76 },
        { id: '4', name: 'Meeting Reminder', category: 'email', content: 'This is a reminder for our meeting tomorrow at...', usage_count: 54 },
        { id: '5', name: 'Proposal Sent', category: 'email', content: 'Attached is the proposal we discussed...', usage_count: 112 },
        { id: '6', name: 'Quick Check-in', category: 'whatsapp', content: 'Just checking in! Any questions about the offer?', usage_count: 89 }
    ];

    const recentCalls = [
        { time: '10:30 AM', contact: 'Ahmed Hassan', duration: '12 min', outcome: 'Follow-up scheduled', deal: 'Enterprise License' },
        { time: '09:15 AM', contact: 'Sara Ali', duration: '8 min', outcome: 'Sent proposal', deal: 'Startup Package' },
        { time: 'Yesterday', contact: 'Mohamed Saeed', duration: '15 min', outcome: 'Demo completed', deal: 'Renewal Deal' }
    ];

    const upcomingMeetings = [
        { time: 'Today 2:00 PM', contact: 'Ahmed Hassan', type: 'Pricing Call', location: 'Zoom' },
        { time: 'Tomorrow 11:00 AM', contact: 'Laila Mohamed', type: 'Demo', location: 'Google Meet' },
        { time: 'Friday 3:30 PM', contact: 'Omar Khalid', type: 'Follow-up', location: 'Phone' }
    ];

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Communication Hub
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Templates, call logs, and meeting scheduler</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">6</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Active Templates</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">24</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Calls Today</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">45</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Emails Sent</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">8</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Meetings This Week</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'templates' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Templates
                            {activeTab === 'templates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('scheduler')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'scheduler' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Scheduler
                            {activeTab === 'scheduler' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('log')}
                            className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'log' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Phone className="w-4 h-4 inline mr-2" />
                            Call Log
                            {activeTab === 'log' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Templates Tab */}
                    {activeTab === 'templates' && (
                        <div>
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search templates..."
                                        className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Templates List */}
                            <div className="space-y-3">
                                {filteredTemplates.map(template => (
                                    <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.category === 'email' ? 'bg-blue-100 text-blue-600' :
                                                        template.category === 'whatsapp' ? 'bg-green-100 text-green-600' :
                                                            'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    {template.category === 'email' && <Mail className="w-5 h-5" />}
                                                    {template.category === 'whatsapp' && <MessageSquare className="w-5 h-5" />}
                                                    {template.category === 'call' && <Phone className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{template.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Used {template.usage_count} times</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <Send className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 pl-12">
                                            {template.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scheduler Tab */}
                    {activeTab === 'scheduler' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Meetings</h3>
                                <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                                    <Plus className="w-4 h-4 inline mr-1" /> Book Meeting
                                </button>
                            </div>
                            <div className="space-y-3">
                                {upcomingMeetings.map((meeting, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{meeting.type}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">with {meeting.contact}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {meeting.time}
                                                </span>
                                                <span>•</span>
                                                <span>{meeting.location}</span>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Call Log Tab */}
                    {activeTab === 'log' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">Recent Calls</h3>
                                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                                    <Phone className="w-4 h-4 inline mr-1" /> Log Call
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentCalls.map((call, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{call.contact}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{call.deal}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {call.time}
                                                </span>
                                                <span>•</span>
                                                <span>{call.duration}</span>
                                                <span>•</span>
                                                <span className="text-green-600 font-bold">{call.outcome}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
