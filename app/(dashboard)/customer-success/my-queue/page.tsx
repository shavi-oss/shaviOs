"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    Filter,
    SortAsc,
    MoreHorizontal,
    MessageSquare,
    Zap
} from 'lucide-react';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    customer: string;
    created_at: string;
    sla_due: string; // ISO String
    channel: 'email' | 'whatsapp' | 'telegram';
}

export default function MyQueuePage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        // Mock Data for My Queue
        // In real app, fetch where assigned_to = me
        setTickets([
            { id: '1025', subject: 'Login Issue on Portal', status: 'open', priority: 'high', customer: 'Ahmed Ali', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), sla_due: new Date(Date.now() + 1000 * 60 * 90).toISOString(), channel: 'email' },
            { id: '1024', subject: 'Payment Failed (Urgent)', status: 'open', priority: 'urgent', customer: 'Sarah Khan', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), sla_due: new Date(Date.now() - 1000 * 60 * 10).toISOString(), channel: 'whatsapp' }, // Breach
            { id: '1021', subject: 'Course Certificate', status: 'pending', priority: 'medium', customer: 'Mohamed E.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), sla_due: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(), channel: 'telegram' },
            { id: '1018', subject: 'Video Player Bug', status: 'open', priority: 'medium', customer: 'Laila M.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), sla_due: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(), channel: 'email' },
        ]);
    }, []);

    const getSLAStatus = (due: string) => {
        const diff = new Date(due).getTime() - Date.now();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 0) return { type: 'breach', label: `Overdue by ${Math.abs(minutes)}m`, color: 'bg-red-100 text-red-700 border-red-200' };
        if (minutes < 60) return { type: 'warning', label: `${minutes}m left`, color: 'bg-orange-100 text-orange-700 border-orange-200' };
        return { type: 'safe', label: `${Math.floor(minutes / 60)}h ${minutes % 60}m`, color: 'bg-green-100 text-green-700 border-green-200' };
    };

    const getPriorityIcon = (p: string) => {
        if (p === 'urgent') return <Zap className="w-4 h-4 text-red-500 fill-red-500" />;
        if (p === 'high') return <Zap className="w-4 h-4 text-orange-500" />;
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
    };

    const getChannelIcon = (c: string) => {
        switch (c) {
            case 'whatsapp': return <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">WA</span>;
            case 'telegram': return <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">TG</span>;
            default: return <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Mail</span>;
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        My Queue
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Your personal prioritized task list.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4" /> 1 Breach
                    </div>
                    <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg flex items-center gap-2 border border-orange-100 font-bold text-sm">
                        <Clock className="w-4 h-4" /> 2 Warning
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 mb-6">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-gray-200 dark:shadow-none">All Assigned (4)</button>
                <button className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500">Urgent (1)</button>
                <button className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700">Pending (1)</button>

                <div className="flex-1"></div>

                <button className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <SortAsc className="w-4 h-4" /> Sort by SLA
                </button>
            </div>

            {/* Ticket List */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-bold w-12">Pri</th>
                            <th className="px-6 py-4 font-bold">Subject</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">SLA Timer</th>
                            <th className="px-6 py-4 font-bold">Customer</th>
                            <th className="px-6 py-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {tickets.map(ticket => {
                            const sla = getSLAStatus(ticket.sla_due);
                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)}
                                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${sla.type === 'breach' ? 'bg-red-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div title={ticket.priority}>{getPriorityIcon(ticket.priority)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getChannelIcon(ticket.channel)}
                                            <span className="font-bold text-gray-900 dark:text-white">{ticket.subject}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 pl-8">#{ticket.id} • Opened {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 w-fit text-xs font-bold px-2 py-1 rounded border ${sla.color}`}>
                                            {sla.type === 'breach' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {sla.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ticket.customer}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State / Motivation */}
            {tickets.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">Your queue is empty. Great job!</p>
                </div>
            )}
        </div>
    );
}
