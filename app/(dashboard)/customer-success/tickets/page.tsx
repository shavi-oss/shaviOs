"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Filter,
    LayoutGrid,
    List as ListIcon,
    Plus,
    Search,
    Clock,
    User,
    MoreHorizontal
} from 'lucide-react';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    customer_name: string;
    created_at: string;
    tags: string[];
}

export default function TicketsPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock initial data if DB empty
    const MOCK_TICKETS = [
        { id: '1', subject: 'Login issue on student portal', status: 'open', priority: 'high', customer_name: 'Ahmed Ali', created_at: new Date().toISOString(), tags: ['bug', 'urgent'] },
        { id: '2', subject: 'Refund request for Course A', status: 'pending', priority: 'medium', customer_name: 'Sarah Khan', created_at: new Date().toISOString(), tags: ['finance'] },
        { id: '3', subject: 'Certificate not received', status: 'resolved', priority: 'low', customer_name: 'Mohamed E.', created_at: new Date().toISOString(), tags: ['admin'] },
    ];

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('support_tickets').select('*');
        if (data && data.length > 0) {
            setTickets(data as any);
        } else {
            setTickets(MOCK_TICKETS);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-purple-100 text-purple-700';
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 font-bold';
            case 'high': return 'text-orange-600 font-medium';
            case 'medium': return 'text-blue-600';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-2xl font-bold">All Tickets</h1>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}><ListIcon className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('board')} className={`p-2 rounded ${viewMode === 'board' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90">
                        <Plus className="w-4 h-4" /> New Ticket
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" placeholder="Search tickets..." />
                </div>
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-600 font-medium hover:bg-gray-50">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Subject</th>
                                    <th className="px-6 py-4 font-bold">Customer</th>
                                    <th className="px-6 py-4 font-bold">Priority</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{ticket.subject}</p>
                                            <div className="flex gap-2 mt-1">
                                                {ticket.tags?.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {ticket.customer_name[0]}
                                                </div>
                                                {ticket.customer_name}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 uppercase text-xs ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BOARD VIEW */}
            {viewMode === 'board' && (
                <div className="flex gap-4 overflow-x-auto h-full pb-4">
                    {['open', 'in_progress', 'pending', 'resolved'].map(column => (
                        <div key={column} className="min-w-[300px] bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col h-full border border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold uppercase text-gray-500 text-xs mb-4 flex justify-between">
                                {column.replace('_', ' ')}
                                <span className="bg-white dark:bg-gray-800 px-2 rounded shadow-sm text-gray-900 dark:text-gray-100">{tickets.filter(t => t.status === column).length}</span>
                            </h3>
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {tickets.filter(t => t.status === column).map(ticket => (
                                    <div key={ticket.id} onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                                            <MoreHorizontal className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-2">{ticket.subject}</h4>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.customer_name}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2d</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
