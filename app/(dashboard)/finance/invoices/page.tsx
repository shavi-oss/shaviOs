"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    Plus,
    FileText,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Download
} from 'lucide-react';

interface Invoice {
    id: string;
    invoice_number: number;
    customer_name: string;
    customer_email?: string;
    amount: number;
    status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    due_date: string;
    paid_at?: string;
    created_at: string;
}

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    async function fetchInvoices() {
        setLoading(true);
        try {
            const supabase = createClient();
            let query = supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) {
                // Fallback if table doesn't exist yet (graceful error handling)
                console.warn('Invoices table might not exist yet:', error.message);
                setInvoices([]);
            } else {
                setInvoices(data || []);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredInvoices = invoices.filter(invoice =>
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_number.toString().includes(searchTerm)
    );

    const getStatusConfig = (status: string) => {
        const configs = {
            paid: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'مدفوع' },
            pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'معلق' },
            overdue: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle, label: 'متأخر' },
            draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: FileText, label: 'مسودة' },
            cancelled: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500', icon: FileText, label: 'ملغي' },
        };
        return configs[status as keyof typeof configs] || configs.draft;
    };

    const stats = {
        total_revenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
        pending_amount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
        overdue_amount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
        total_count: invoices.length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الفواتير...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">الفواتير</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة الفواتير والمدفوعات
                    </p>
                </div>
                <button
                    onClick={() => router.push('/finance/invoices/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    فاتورة جديدة
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">إجمالي الإيرادات</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {stats.total_revenue.toLocaleString('ar-EG')} ج.م
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">مبالغ معلقة</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                {stats.pending_amount.toLocaleString('ar-EG')} ج.م
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">مستحقات متأخرة</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {stats.overdue_amount.toLocaleString('ar-EG')} ج.م
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">إجمالي الفواتير</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {stats.total_count}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث برقم الفاتورة أو اسم العميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="paid">مدفوع</option>
                        <option value="pending">معلق</option>
                        <option value="overdue">متأخر</option>
                        <option value="draft">مسودة</option>
                        <option value="cancelled">ملغي</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">رقم الفاتورة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المبلغ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التاريخ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الاستحقاق</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        لا توجد فواتير مطابقة
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => {
                                    const statusConfig = getStatusConfig(invoice.status);
                                    const StatusIcon = statusConfig.icon;
                                    return (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                                                #{invoice.invoice_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {invoice.customer_name}
                                                </div>
                                                {invoice.customer_email && (
                                                    <div className="text-xs text-gray-500">
                                                        {invoice.customer_email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                                {invoice.amount.toLocaleString('ar-EG')} ج.م
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(invoice.created_at).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(invoice.due_date).toLocaleDateString('ar-EG')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => window.print()}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                                                    title="تحميل PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
