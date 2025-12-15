"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
    Video,
    Search,
    Filter,
    ArrowUpRight,
    DollarSign,
    MousePointer,
    Eye,
    Target
} from 'lucide-react';

interface AdCampaign {
    id: string;
    platform: string;
    name: string;
    status: string;
    daily_budget: number | null;
    total_spend: number | null;
    impressions: number | null;
    clicks: number | null;
    roas: number | null;
    ctr: number | null;
    cpc: number | null;
    cost_per_lead: number | null;
}

const PLATFORM_ICONS: Record<string, any> = {
    meta: Facebook,
    instagram: Instagram,
    google: Search,
    tiktok: Video,
    linkedin: Linkedin,
    twitter: Twitter,
    snapchat: Video // Fallback
};

const PLATFORM_COLORS: Record<string, string> = {
    meta: 'text-blue-600 bg-blue-50',
    instagram: 'text-pink-600 bg-pink-50',
    google: 'text-red-500 bg-red-50',
    tiktok: 'text-black bg-gray-100 dark:text-white dark:bg-gray-800',
    linkedin: 'text-blue-700 bg-blue-50',
    twitter: 'text-sky-500 bg-sky-50',
};

export default function AdsManagerPage() {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase.from('ad_campaigns').select('*').order('total_spend', { ascending: false });
            if (data) setCampaigns(data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">مدير الإعلانات الموحد</h1>
                    <p className="text-muted-foreground mt-2">إدارة حملات Meta, Google, TikTok, LinkedIn من مكان واحد</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg opacity-50 cursor-not-allowed text-sm">
                    + إنشاء حملة (قريباً)
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm">إجمالي الإنفاق</h3>
                    <p className="text-2xl font-bold mt-1">EGP 24,500</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg"><Eye className="w-5 h-5 text-blue-600" /></div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+45%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm">الظهور (Impressions)</h3>
                    <p className="text-2xl font-bold mt-1">840.5K</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg"><MousePointer className="w-5 h-5 text-purple-600" /></div>
                    </div>
                    <h3 className="text-gray-500 text-sm">النقرات (Clicks)</h3>
                    <p className="text-2xl font-bold mt-1">14,200</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 rounded-lg"><Target className="w-5 h-5 text-yellow-600" /></div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">4.2x</span>
                    </div>
                    <h3 className="text-gray-500 text-sm">العائد (ROAS)</h3>
                    <p className="text-2xl font-bold mt-1">4.2</p>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold">الحملات النشطة</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Search className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Filter className="w-4 h-4 text-gray-500" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-right font-medium">المنصة</th>
                                <th className="px-6 py-4 text-right font-medium">الحملة</th>
                                <th className="px-6 py-4 text-right font-medium">الحالة</th>
                                <th className="px-6 py-4 text-right font-medium">الميزانية</th>
                                <th className="px-6 py-4 text-right font-medium">الإنفاق</th>
                                <th className="px-6 py-4 text-right font-medium">ROAS</th>
                                <th className="px-6 py-4 text-right font-medium">النتائج</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {campaigns.map(campaign => {
                                const Icon = PLATFORM_ICONS[campaign.platform] || Search;
                                const colorClass = PLATFORM_COLORS[campaign.platform] || 'bg-gray-100';

                                return (
                                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {campaign.name}
                                            <div className="text-xs text-gray-400 font-normal mt-0.5">ID: {campaign.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {campaign.status === 'active' ? 'نشط' : 'متوقف'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {campaign.daily_budget ? campaign.daily_budget.toLocaleString() : 0} EGP
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {campaign.total_spend ? campaign.total_spend.toLocaleString() : 0} EGP
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-green-600">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {campaign.roas ? campaign.roas.toFixed(2) : '0.00'}x
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-xs text-gray-500">
                                                <div>{(campaign.clicks?.toLocaleString() || 0)} Click</div>
                                                <div>{(campaign.impressions?.toLocaleString() || 0)} Imp</div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
