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
    Plus,
    Download
} from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    customer_name: string | null;
    customer_company?: string | null;
    value: number | null;
    currency?: string | null;
    stage: string;
    created_at: string;
    expected_close_date?: string | null;
    assigned_to_id?: string | null;
}

interface DealStats {
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    lostDeals: number;
    winRate: number;
}

const STAGE_LABELS: Record<string, string> = {
    lead: 'عميل محتمل',
    contacted: 'تم التواصل',
    proposal: 'عرض سعر',
    negotiation: 'تفاوض',
    closed_won: 'تم الإغلاق (نجاح)',
    closed_lost: 'تم الإغلاق (خسارة)'
};

const STAGE_COLORS: Record<string, string> = {
    lead: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    contacted: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    proposal: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    negotiation: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    closed_won: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed_lost: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function DealsListPage() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stats, setStats] = useState<DealStats>({
        totalDeals: 0,
        totalValue: 0,
        wonDeals: 0,
        lostDeals: 0,
        winRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('all');

    useEffect(() => {
        fetchDeals();
    }, [stageFilter]);

    const fetchDeals = async () => {
        try {
            const supabase = createClient();

            // Fixed query - direct table access without invalid joins
            let query = supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply stage filter if selected
            if (stageFilter !== 'all') {
                query = query.eq('stage', stageFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.warn('Unable to fetch deals:', error.message || 'Table may be empty');
                setDeals([]);
                setLoading(false);
                return;
            }

            if (data) {
                setDeals(data);
                calculateStats(data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch deals:', err);
            setDeals([]);
            setLoading(false);
        }
    };

    const calculateStats = (dealsData: Deal[]) => {
        const totalDeals = dealsData.length;
        const totalValue = dealsData.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const wonDeals = dealsData.filter(d => d.stage === 'closed_won').length;
        const lostDeals = dealsData.filter(d => d.stage === 'closed_lost').length;
        const closedDeals = wonDeals + lostDeals;
        const winRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;

        setStats({
            totalDeals,
            totalValue,
            wonDeals,
            lostDeals,
            winRate
        });
    };

    const exportToCSV = () => {
        const headers = ['العنوان', 'اسم العميل', 'الشركة', 'القيمة', 'العملة', 'المرحلة', 'تاريخ الإنشاء'];
        const csvData = filteredDeals.map(deal => [
            deal.title,
            deal.customer_name,
            deal.customer_company || '',
            deal.value,
            deal.currency || 'EGP',
            STAGE_LABELS[deal.stage] || deal.stage,
            new Date(deal.created_at).toLocaleDateString('ar-EG')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `deals_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredDeals = deals.filter(deal =>
        deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer_company?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm"
                    >
                        <Table className="w-4 h-4" />
                        عرض Kanban
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        تصدير CSV
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الصفقات</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalDeals}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">قيمة Pipeline</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {(stats.totalValue / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs text-gray-400 mt-1">EGP</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">صفقات ناجحة</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.wonDeals}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">معدل النجاح</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.winRate.toFixed(0)}%
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <MoreVertical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث عن صفقة أو عميل أو مسؤول..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                >
                    <option value="all">كل المراحل</option>
                    <option value="lead">عميل محتمل</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="proposal">عرض سعر</option>
                    <option value="negotiation">تفاوض</option>
                    <option value="closed_won">نجاح</option>
                    <option value="closed_lost">خسارة</option>
                </select>
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
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(deal.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-gray-200">{deal.customer_name}</div>
                                    {deal.customer_company && (
                                        <div className="text-xs text-gray-500 mt-1">{deal.customer_company}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {deal.value?.toLocaleString('ar-EG')} {deal.currency || 'EGP'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${STAGE_COLORS[deal.stage] || 'bg-gray-100'}`}>
                                        {STAGE_LABELS[deal.stage] || deal.stage}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => router.push(`/sales/deals/${deal.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-primary text-xs flex items-center gap-1 font-medium"
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> عرض
                                        </button>
                                        <button
                                            onClick={() => router.push(`/sales/quotes/new?deal_id=${deal.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-green-600"
                                            title="إنشاء عرض سعر"
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
