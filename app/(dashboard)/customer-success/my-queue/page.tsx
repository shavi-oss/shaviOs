import { getMyTickets } from '@/app/actions/tickets';
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
import Link from 'next/link';

type Ticket = Awaited<ReturnType<typeof getMyTickets>>[0];

export default async function MyQueuePage() {
    // Server-side data fetching
    const tickets = await getMyTickets();

    const getSLAStatus = (createdAt: string) => {
        // Calculate SLA based on created time
        // For now, simple logic: tickets older than 2 hours are overdue
        const created = new Date(createdAt);
        const now = new Date();
        const diff = now.getTime() - created.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours >= 2) {
            return {
                type: 'breach',
                label: `Overdue by ${hours}h ${minutes}m`,
                color: 'bg-red-100 text-red-700 border-red-200'
            };
        } else if (hours >= 1) {
            return {
                type: 'warning',
                label: `${2 - hours}h ${60 - minutes}m left`,
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            };
        }
        return {
            type: 'safe',
            label: `${2 - hours}h ${60 - minutes}m left`,
            color: 'bg-green-100 text-green-700 border-green-200'
        };
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'urgent') return <Zap className="w-4 h-4 text-red-500 fill-red-500" />;
        if (priority === 'high') return <Zap className="w-4 h-4 text-orange-500" />;
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
    };

    const breachCount = tickets.filter(t => {
        const sla = getSLAStatus(t.created_at || '');
        return sla.type === 'breach';
    }).length;

    const warningCount = tickets.filter(t => {
        const sla = getSLAStatus(t.created_at || '');
        return sla.type === 'warning';
    }).length;

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
                    {breachCount > 0 && (
                        <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4" /> {breachCount} Breach
                        </div>
                    )}
                    {warningCount > 0 && (
                        <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg flex items-center gap-2 border border-orange-100 font-bold text-sm">
                            <Clock className="w-4 h-4" /> {warningCount} Warning
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 mb-6">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-gray-200 dark:shadow-none">
                    All Assigned ({tickets.length})
                </button>
                <button className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500">
                    Urgent ({tickets.filter(t => t.priority === 'urgent').length})
                </button>
                <button className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700">
                    Pending ({tickets.filter(t => t.status === 'in_progress').length})
                </button>

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
                            const sla = getSLAStatus(ticket.created_at || '');
                            return (
                                <tr
                                    key={ticket.id}
                                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${sla.type === 'breach' ? 'bg-red-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div title={ticket.priority || 'medium'}>{getPriorityIcon(ticket.priority || 'medium')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/customer-success/tickets/${ticket.id}`} className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                                                {ticket.title}
                                            </span>
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-1">
                                            #{ticket.id.slice(0, 8)} • Opened {new Date(ticket.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
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
                                        {ticket.student_name || 'Unknown'}
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

            {/* Empty State */}
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
