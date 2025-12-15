"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    FileText,
    DollarSign,
    Calendar,
    Download,
    Eye,
    Send,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Plus,
    Filter
} from 'lucide-react';

interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    issue_date: string;
    due_date: string;
    paid_date?: string;
    items_count: number;
}

export default function InvoiceManagementPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Fetch deals to create invoices from
            const { data: deals } = await supabase
                .from('deals')
                .select('*')
                .limit(20);

            // Generate mock invoices
            const mockInvoices: Invoice[] = deals?.map((deal, idx) => {
                const issueDate = new Date(deal.created_at);
                const dueDate = new Date(issueDate);
                dueDate.setDate(dueDate.getDate() + 30);

                const statuses: Array<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'> =
                    ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
                const status = statuses[idx % 5];

                return {
                    id: `inv-${idx + 1}`,
                    invoice_number: `INV-2025-${String(idx + 1).padStart(4, '0')}`,
                    customer_name: deal.customer_name || 'عميل',
                    amount: deal.value || 0,
                    status,
                    issue_date: issueDate.toISOString(),
                    due_date: dueDate.toISOString(),
                    paid_date: status === 'paid' ? new Date().toISOString() : undefined,
                    items_count: 3 + (idx % 5)
                };
            }) || [];

            setInvoices(mockInvoices);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filterStatus === 'all') return true;
        return inv.status === filterStatus;
    });

    const stats = {
        total: invoices.reduce((sum, i) => sum + i.amount, 0),
        paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
        pending: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0),
        overdue: invoices.filter(i => i.status === 'overdue').length,
        draft: invoices.filter(i => i.status === 'draft').length
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
            case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            draft: 'مسودة',
            sent: 'مرسلة',
            paid: 'مدفوعة',
            overdue: 'متأخرة',
            cancelled: 'ملغاة'
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
            sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        إدارة الفواتير
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة وإدارة الفواتير</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    فاتورة جديدة
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.total / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي الفواتير</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.paid / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مدفوعة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.pending / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معلقة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متأخرة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مسودات</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">كل الحالات</option>
                    <option value="draft">مسودات</option>
                    <option value="sent">مرسلة</option>
                    <option value="paid">مدفوعة</option>
                    <option value="overdue">متأخرة</option>
                    <option value="cancelled">ملغاة</option>
                </select>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">رقم الفاتورة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المبلغ</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الإصدار</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الاستحقاق</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        لا توجد فواتير
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {invoice.invoice_number}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {invoice.items_count} عنصر
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.customer_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                {invoice.amount.toLocaleString('ar-EG')} جنيه
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(invoice.issue_date).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(invoice.due_date).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(invoice.status)}
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                    {getStatusLabel(invoice.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <Download className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <Send className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
