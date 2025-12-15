"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    FileText,
    Plus,
    Download,
    Eye,
    Edit,
    Send,
    DollarSign,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Filter
} from 'lucide-react';

interface Quote {
    id: string;
    quote_number: string;
    customer_name: string;
    title: string;
    total_amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    valid_until: string;
    created_at: string;
    items_count?: number;
}

export default function QuotesManagementPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Fetch deals to create quotes from
            const { data: deals } = await supabase
                .from('deals')
                .select('*')
                .limit(15);

            // Generate mock quotes from deals
            const mockQuotes: Quote[] = deals?.map((deal, idx) => ({
                id: `quote-${idx + 1}`,
                quote_number: `Q-2025-${String(idx + 1).padStart(4, '0')}`,
                customer_name: deal.customer_name || 'عميل',
                title: deal.title || 'عرض سعر',
                total_amount: deal.value || 0,
                status: ['draft', 'sent', 'accepted', 'rejected'][idx % 4] as any,
                valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
                created_at: deal.created_at,
                items_count: 3 + (idx % 5)
            })) || [];

            setQuotes(mockQuotes);
        } catch (err) {
            console.error('Failed to fetch quotes:', err);
            setQuotes([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        if (filterStatus === 'all') return true;
        return quote.status === filterStatus;
    });

    const stats = {
        draft: quotes.filter(q => q.status === 'draft').length,
        sent: quotes.filter(q => q.status === 'sent').length,
        accepted: quotes.filter(q => q.status === 'accepted').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        totalValue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total_amount, 0)
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'accepted': return 'مقبول';
            case 'rejected': return 'مرفوض';
            case 'sent': return 'مرسل';
            default: return 'مسودة';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل عروض الأسعار...</p>
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
                        إدارة عروض الأسعار
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إنشاء ومتابعة عروض الأسعار</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowNewQuoteModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        عرض سعر جديد
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مسودات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Send className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sent}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مرسلة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مقبولة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مرفوضة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">قيمة مقبولة</div>
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
                    <option value="accepted">مقبولة</option>
                    <option value="rejected">مرفوضة</option>
                </select>
            </div>

            {/* Quotes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuotes.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        لا توجد عروض أسعار
                    </div>
                ) : (
                    filteredQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {quote.quote_number}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {quote.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {quote.customer_name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(quote.status)}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="mb-4">
                                <div className="text-2xl font-black text-green-600 dark:text-green-400">
                                    {quote.total_amount.toLocaleString('ar-EG')} جنيه
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {quote.items_count} عنصر
                                </div>
                            </div>

                            {/* Status & Date */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                                    {getStatusLabel(quote.status)}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(quote.valid_until).toLocaleDateString('ar-EG')}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    عرض
                                </button>
                                <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                    <Edit className="w-3 h-3" />
                                    تعديل
                                </button>
                                <button className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                                    <Download className="w-3 h-3" />
                                    PDF
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Quote Modal */}
            {showNewQuoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">عرض سعر جديد</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            سيتم إضافة نموذج إنشاء عرض السعر هنا
                        </p>
                        <button
                            onClick={() => setShowNewQuoteModal(false)}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
