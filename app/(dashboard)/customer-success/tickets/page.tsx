"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    Plus,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

interface Ticket {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
    created_at: string;
    updated_at?: string;
    student_id?: string;
    student_name?: string;
    student_email?: string;
    assigned_to_id?: string;
    assigned_to_name?: string;
}

export default function TicketsListPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchTickets();
    }, [priorityFilter, statusFilter]);

    async function fetchTickets() {
        setLoading(true);
        try {
            const supabase = createClient();
            let query = supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (priorityFilter !== 'all') {
                query = query.eq('priority', priorityFilter);
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const search = searchTerm.toLowerCase();
        return (
            ticket.title?.toLowerCase().includes(search) ||
            ticket.description?.toLowerCase().includes(search) ||
            ticket.student_name?.toLowerCase().includes(search)
        );
    });

    const getPriorityConfig = (priority: string) => {
        const configs = {
            urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: ArrowUp, label: 'عاجل' },
            high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: ArrowUp, label: 'عالي' },
            medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Minus, label: 'متوسط' },
            low: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: ArrowDown, label: 'منخفض' },
        };
        return configs[priority as keyof typeof configs] || configs.medium;
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            open: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle, label: 'مفتوح' },
            in_progress: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Clock, label: 'قيد المعالجة' },
            pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'معلق' },
            resolved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'محلول' },
            closed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle, label: 'مغلق' },
        };
        return configs[status as keyof typeof configs] || configs.open;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التذاكر...</p>
                </div>
            </div>
        );
    }

    const stats = {
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">تذاكر الدعم</h1>
                    <p className="text-muted-foreground mt-2">
                        {filteredTickets.length} تذكرة
                    </p>
                </div>
                <button
                    onClick={() => router.push('/customer-success/tickets/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    تذكرة جديدة
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">مفتوح</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.open}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/30">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400">قيد المعالجة</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.in_progress}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">معلق</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400">محلول</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolved}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="ابحث بالعنوان، الوصف، أو اسم الطالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">جميع الأولويات</option>
                        <option value="urgent">عاجل</option>
                        <option value="high">عالي</option>
                        <option value="medium">متوسط</option>
                        <option value="low">منخفض</option>
                    </select>
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">جميع الحالات</option>
                    <option value="open">مفتوح</option>
                    <option value="in_progress">قيد المعالجة</option>
                    <option value="pending">معلق</option>
                    <option value="resolved">محلول</option>
                    <option value="closed">مغلق</option>
                </select>
            </div>

            {/* Tickets Table */}
            {filteredTickets.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا توجد تذاكر
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'لم يتم العثور على نتائج مطابقة' : 'لا توجد تذاكر دعم حالياً'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التذكرة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الطالب</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الأولوية</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">مسند إلى</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTickets.map((ticket) => {
                                    const priorityConfig = getPriorityConfig(ticket.priority);
                                    const statusConfig = getStatusConfig(ticket.status);
                                    const PriorityIcon = priorityConfig.icon;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr
                                            key={ticket.id}
                                            onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {ticket.title}
                                                    </div>
                                                    {ticket.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">
                                                            {ticket.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {ticket.student_name || 'غير محدد'}
                                                </div>
                                                {ticket.student_email && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {ticket.student_email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${priorityConfig.color}`}>
                                                    <PriorityIcon className="w-3 h-3" />
                                                    {priorityConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ticket.assigned_to_name ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <User className="w-4 h-4" />
                                                        {ticket.assigned_to_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">غير مسند</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(ticket.created_at).toLocaleDateString('ar-EG')}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
