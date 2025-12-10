"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Table,
    Search,
    Filter,
    ArrowUpRight,
    MoreVertical,
    FileText,
    Plus
} from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    customer_name: string;
    customer_company?: string;
    value: number;
    stage: string;
    created_at: string;
}

const STAGE_LABELS: Record<string, string> = {
    new: 'جديد',
    contacted: 'تم التواصل',
    qualified: 'مؤهل',
    proposal: 'عرض سعر',
    negotiation: 'تفاوض',
    closed_won: 'تم الإغلاق (نجاح)',
    closed_lost: 'تم الإغلاق (خسارة)'
};

const STAGE_COLORS: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700',
    contacted: 'bg-indigo-50 text-indigo-700',
    qualified: 'bg-purple-50 text-purple-700',
    proposal: 'bg-yellow-50 text-yellow-700',
    negotiation: 'bg-orange-50 text-orange-700',
    closed_won: 'bg-green-50 text-green-700',
    closed_lost: 'bg-red-50 text-red-700'
};

export default function DealsListPage() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (data) setDeals(data);
        setLoading(false);
    };

    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading deals list...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الصفقات</h1>
                    <p className="text-gray-500 mt-2">عرض قائمة الصفقات الكاملة</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/sales/pipeline')}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm"
                    >
                        <Table className="w-4 h-4" />
                        عرض Kanban
                    </button>
                    <button
                        onClick={() => router.push('/sales/deals/new')}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        صفقة جديدة
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث عن صفقة أو عميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <button className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Deals Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الصفقة</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">العميل</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">القيمة</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المرحلة</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredDeals.map((deal) => (
                            <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{deal.title}</div>
                                    <div className="text-xs text-gray-400">{new Date(deal.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-gray-200">{deal.customer_name}</div>
                                    <div className="text-xs text-gray-500">{deal.customer_company}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {deal.value?.toLocaleString()} EGP
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[deal.stage] || 'bg-gray-100'}`}>
                                        {STAGE_LABELS[deal.stage] || deal.stage}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => router.push(`/sales/deals/${deal.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-primary text-xs flex items-center gap-1"
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> عرض
                                        </button>
                                        <button
                                            onClick={() => router.push(`/sales/quotes/new?deal_id=${deal.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-green-600"
                                            title="Create Quote"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDeals.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    لا توجد صفقات هنا. <button onClick={() => router.push('/sales/deals/new')} className="text-primary underline">أضف صفقة جديدة</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
