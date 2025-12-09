"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    BarChart3,
    DollarSign,
    Target,
    MousePointer,
    Eye
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    type: string;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    start_date: string;
    end_date: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setCampaigns(data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const filteredCampaigns = campaigns.filter(c =>
        filterStatus === 'all' || c.status === filterStatus
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">الحملات التسويقية</h1>
                    <p className="text-muted-foreground mt-2">إدارة ومتابعة أداء الحملات الإعلانية</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>حملة جديدة</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث عن حملة..."
                        className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="active">نشطة</option>
                        <option value="paused">متوقفة</option>
                        <option value="completed">مكتملة</option>
                        <option value="draft">مسودة</option>
                    </select>
                </div>
            </div>

            {/* Campaigns Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحميل الحملات...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary/50 transition-all shadow-sm">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                            {campaign.status === 'active' ? 'نشطة' :
                                                campaign.status === 'completed' ? 'مكتملة' :
                                                    campaign.status === 'paused' ? 'متوقفة' : 'مسودة'}
                                        </span>
                                        <h3 className="text-xl font-bold mt-2 text-gray-900 dark:text-white line-clamp-1">
                                            {campaign.name}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10">
                                    {campaign.description}
                                </p>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span>الميزانية</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {campaign.budget.toLocaleString()} EGP
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <Target className="w-3 h-3" />
                                            <span>تحويلات</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {campaign.conversions}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <Eye className="w-3 h-3" />
                                            <span>ظهور</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {campaign.impressions.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <MousePointer className="w-3 h-3" />
                                            <span>نقرات</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {campaign.clicks.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(campaign.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button className="text-sm font-medium text-primary hover:text-primary/80">
                                        التفاصيل &larr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
