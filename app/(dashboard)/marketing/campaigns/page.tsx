"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCampaigns } from '@/app/actions/marketing';
import NewCampaignModal from './new-campaign-modal';
import {
    Megaphone,
    // Plus, // Removed as it's inside the modal now
    TrendingUp,
    Users,
    Eye,
    MousePointer,
    DollarSign,
    Calendar,
    Target,
    BarChart3,
    Mail,
    Share2
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    type: 'email' | 'social' | 'ads' | 'content';
    status: 'active' | 'paused' | 'completed' | 'draft';
    budget: number;
    spent: number; // Might be null/0 initially from DB
    impressions: number;
    clicks: number;
    conversions: number;
    start_date: string;
    end_date: string;
    ctr: number;
    roi: number;
}

export default function MarketingCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const data = await getCampaigns();
            
            // Map DB data to UI interface if needed, or just use as is if compatible
            // Assuming DB fields match Campaign interface mostly, but handling nulls
            const mappedCampaigns: Campaign[] = data.map((c: any) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                status: c.status,
                budget: c.budget || 0,
                spent: c.spent || 0,
                impressions: c.impressions || 0,
                clicks: c.clicks || 0,
                conversions: c.conversions || 0,
                start_date: c.start_date,
                end_date: c.end_date,
                ctr: c.ctr || 0,
                roi: c.roas || 0 // roas vs roi
            }));

            setCampaigns(mappedCampaigns);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
        const matchesType = filterType === 'all' || campaign.type === filterType;
        return matchesStatus && matchesType;
    });

    const stats = {
        totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
        totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
        totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
        totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
        totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
        avgCTR: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length : 0,
        avgROI: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length : 0
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            email: 'بريد إلكتروني',
            social: 'وسائل تواصل',
            ads: 'إعلانات',
            content: 'محتوى'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            social: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            ads: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            content: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            active: 'نشطة',
            paused: 'متوقفة',
            completed: 'مكتملة',
            draft: 'مسودة'
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
            draft: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الحملات...</p>
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
                        <Megaphone className="w-8 h-8 text-primary" />
                        الحملات التسويقية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إدارة ومتابعة الحملات التسويقية</p>
                </div>
                <NewCampaignModal />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalImpressions / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مرات الظهور</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <MousePointer className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalClicks.toLocaleString('ar-EG')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">النقرات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalConversions}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">التحويلات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgROI.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط ROI</div>
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
                    <option value="active">نشطة</option>
                    <option value="paused">متوقفة</option>
                    <option value="completed">مكتملة</option>
                    <option value="draft">مسودات</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">كل الأنواع</option>
                    <option value="email">بريد إلكتروني</option>
                    <option value="social">وسائل تواصل</option>
                    <option value="ads">إعلانات</option>
                    <option value="content">محتوى</option>
                </select>
            </div>

            {/* Campaigns Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                    {campaign.name}
                                </h3>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
                                        {getTypeLabel(campaign.type)}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                                        {getStatusLabel(campaign.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">مرات الظهور</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {(campaign.impressions / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">النقرات</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {campaign.clicks}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CTR</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {campaign.ctr.toFixed(2)}%
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ROI</div>
                                <div className={`text-lg font-bold ${campaign.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {campaign.roi.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>الميزانية</span>
                                <span>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{campaign.spent.toLocaleString('ar-EG')} جنيه</span>
                                <span>{campaign.budget.toLocaleString('ar-EG')} جنيه</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                عرض التفاصيل
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                                تعديل
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
