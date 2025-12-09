"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    Search,
    Plus,
    Building2,
    Calendar,
    MoreVertical
} from "lucide-react";

interface Deal {
    id: string;
    title: string;
    value: number;
    currency: string;
    stage: 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    customer_name: string;
    customer_company?: string;
    expected_close_date: string;
    created_at: string;
}

const STAGES = {
    lead: { label: 'عميل محتمل', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    contacted: { label: 'تم التواصل', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    proposal: { label: 'عرض', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    negotiation: { label: 'تفاوض', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    closed_won: { label: 'تم الإغلاق (نجاح)', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    closed_lost: { label: 'تم الإغلاق (خسارة)', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};

export default function PipelinePage() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDeals();
    }, []);

    async function fetchDeals() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Deals table might not exist yet:', error.message);
                setDeals([]);
            } else {
                setDeals(data || []);
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total_value: deals.reduce((sum, deal) => sum + deal.value, 0),
        won_value: deals.filter(d => d.stage === 'closed_won').reduce((sum, deal) => sum + deal.value, 0),
        open_count: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الصفقات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">خط الأنابيب</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة الصفقات ومراحل البيع
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'board'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            لوحة
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            قائمة
                        </button>
                    </div>
                    <button
                        onClick={() => router.push('/sales/deals/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        صفقة جديدة
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">قيمة المحفظة</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.total_value.toLocaleString('ar-EG')} ج.م
                        </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إيرادات محققة</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {stats.won_value.toLocaleString('ar-EG')} ج.م
                        </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">صفقات مفتوحة</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                            {stats.open_count}
                        </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            {viewMode === 'board' ? (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max h-full">
                        {Object.entries(STAGES).map(([stageKey, config]) => {
                            const stageDeals = filteredDeals.filter(d => d.stage === stageKey);
                            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                            return (
                                <div key={stageKey} className="w-80 flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                                    {/* Column Header */}
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{config.label}</h3>
                                            <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                {stageDeals.length}
                                            </span>
                                        </div>
                                        <div className={`h-1 w-full rounded-full ${config.color.split(' ')[0]}`} />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
                                            {stageValue.toLocaleString('ar-EG')} ج.م
                                        </p>
                                    </div>

                                    {/* Draggable Area (Visual only for now) */}
                                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                        {stageDeals.map(deal => (
                                            <div
                                                key={deal.id}
                                                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                                                        {deal.title}
                                                    </h4>
                                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-opacity">
                                                        <MoreVertical className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="truncate">{deal.customer_company || deal.customer_name}</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                        {deal.value.toLocaleString('ar-EG')}
                                                    </span>
                                                    {deal.expected_close_date && (
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(deal.expected_close_date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الصفقة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">القيمة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المرحلة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الإغلاق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredDeals.map((deal) => (
                                    <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{deal.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deal.customer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold">{deal.value.toLocaleString('ar-EG')} ج.م</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${STAGES[deal.stage].color}`}>
                                                {STAGES[deal.stage].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('ar-EG') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
