"use client";

import { useState } from 'react';
import {
    Clock,
    Filter,
    TrendingUp,
    AlertCircle,
    Target,
    Phone,
    Mail,
    MessageSquare,
    ChevronRight,
    Flame
} from 'lucide-react';
import Link from 'next/link';

interface Deal {
    id: string;
    title: string;
    company: string;
    value: number;
    stage: string;
    priority: 'hot' | 'warm' | 'cold';
    sla_due_at: Date;
    last_contact: Date;
    contact_name: string;
    contact_phone: string;
}

export default function MyDealsPage() {
    const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'urgent' | 'overdue'>('all');

    // Mock data
    const deals: Deal[] = [
        {
            id: '1',
            title: 'Enterprise License Deal',
            company: 'Tech Corp',
            value: 50000,
            stage: 'Proposal',
            priority: 'hot',
            sla_due_at: new Date(Date.now() + 5 * 60 * 1000), // 5 min from now
            last_contact: new Date(Date.now() - 30 * 60 * 1000),
            contact_name: 'Ahmed Hassan',
            contact_phone: '+20 123 456 789'
        },
        {
            id: '2',
            title: 'New Customer Onboarding',
            company: 'Startup Inc',
            value: 15000,
            stage: 'Negotiation',
            priority: 'warm',
            sla_due_at: new Date(Date.now() + 45 * 60 * 1000), // 45 min
            last_contact: new Date(Date.now() - 2 * 60 * 60 * 1000),
            contact_name: 'Sara Ali',
            contact_phone: '+20 111 222 333'
        },
        {
            id: '3',
            title: 'Renewal Discussion',
            company: 'Big Enterprise',
            value: 80000,
            stage: 'Contacted',
            priority: 'hot',
            sla_due_at: new Date(Date.now() - 10 * 60 * 1000), // OVERDUE
            last_contact: new Date(Date.now() - 4 * 60 * 60 * 1000),
            contact_name: 'Mohamed Saeed',
            contact_phone: '+20 100 999 888'
        },
        {
            id: '4',
            title: 'Real Estate Package',
            company: 'Property Group',
            value: 25000,
            stage: 'Qualified',
            priority: 'cold',
            sla_due_at: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours
            last_contact: new Date(Date.now() - 24 * 60 * 60 * 1000),
            contact_name: 'Laila Mohamed',
            contact_phone: '+20 122 333 444'
        }
    ];

    const getSLAcolor = (due: Date) => {
        const diff = due.getTime() - Date.now();
        const minutes = diff / (1000 * 60);

        if (minutes < 0) return 'text-red-600 bg-red-50 border-red-200';
        if (minutes < 10) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getSLAtext = (due: Date) => {
        const diff = due.getTime() - Date.now();
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 0) return `Overdue by ${Math.abs(minutes)}m`;
        if (minutes < 60) return `${minutes}m left`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h left`;
    };

    const getPriorityBadge = (priority: string) => {
        if (priority === 'hot') return <div className="flex items-center gap-1 text-red-600"><Flame className="w-3 h-3 fill-red-500" /> Hot</div>;
        if (priority === 'warm') return <div className="flex items-center gap-1 text-orange-600">🟡 Warm</div>;
        return <div className="flex items-center gap-1 text-blue-600">❄️ Cold</div>;
    };

    const filteredDeals = deals.filter(deal => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'hot') return deal.priority === 'hot';
        if (activeFilter === 'urgent') {
            const diff = deal.sla_due_at.getTime() - Date.now();
            return diff < 15 * 60 * 1000 && diff > 0; // < 15 min
        }
        if (activeFilter === 'overdue') return deal.sla_due_at.getTime() < Date.now();
        return true;
    });

    const stats = {
        total: deals.length,
        hot: deals.filter(d => d.priority === 'hot').length,
        urgent: deals.filter(d => (d.sla_due_at.getTime() - Date.now()) < 15 * 60 * 1000 && d.sla_due_at.getTime() > Date.now()).length,
        overdue: deals.filter(d => d.sla_due_at.getTime() < Date.now()).length
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    My Deals
                </h1>
                <p className="text-gray-500 text-sm mt-1">Your active sales pipeline with SLA tracking</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Deals</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.hot}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-red-500" /> Hot Leads
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.urgent}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Urgent
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-red-600">{stats.overdue}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Filter className="w-4 h-4 inline mr-1" /> All ({deals.length})
                </button>
                <button
                    onClick={() => setActiveFilter('hot')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'hot' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                >
                    <Flame className="w-4 h-4 inline mr-1 fill-current" /> Hot Only ({stats.hot})
                </button>
                <button
                    onClick={() => setActiveFilter('urgent')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'urgent' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                >
                    <Clock className="w-4 h-4 inline mr-1" /> Urgent ({stats.urgent})
                </button>
                <button
                    onClick={() => setActiveFilter('overdue')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'overdue' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <AlertCircle className="w-4 h-4 inline mr-1" /> Overdue ({stats.overdue})
                </button>
            </div>

            {/* Deal Cards */}
            <div className="grid gap-4">
                {filteredDeals.map(deal => (
                    <Link
                        key={deal.id}
                        href={`/sales/deals/${deal.id}`}
                        className="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                        {deal.title}
                                    </h3>
                                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-sm text-gray-500">{deal.company}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-green-600">${deal.value.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 mt-1">{deal.stage}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getSLAcolor(deal.sla_due_at)}`}>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {getSLAtext(deal.sla_due_at)}
                                </div>
                                <div className="text-xs font-bold">
                                    {getPriorityBadge(deal.priority)}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <span>{deal.contact_name}</span>
                                <div className="flex gap-1">
                                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Phone className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Mail className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <MessageSquare className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredDeals.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No deals match this filter</p>
                </div>
            )}
        </div>
    );
}
