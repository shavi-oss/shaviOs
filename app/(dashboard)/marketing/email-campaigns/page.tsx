"use client";

import { useEffect, useState } from 'react';
import {
    Mail,
    Send,
    Users,
    Eye,
    MousePointer,
    TrendingUp,
    Calendar,
    Plus,
    Edit,
    Copy,
    Download
} from 'lucide-react';

interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sent' | 'active';
    recipients: number;
    sent: number;
    opened: number;
    clicked: number;
    open_rate: number;
    click_rate: number;
    scheduled_date?: string;
    sent_date?: string;
}

export default function EmailCampaignsPage() {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);

            // Generate mock campaigns
            const mockCampaigns: EmailCampaign[] = Array.from({ length: 12 }, (_, idx) => {
                const recipients = 500 + (idx * 200);
                const sent = recipients;
                const opened = Math.floor(sent * (0.2 + Math.random() * 0.3));
                const clicked = Math.floor(opened * (0.1 + Math.random() * 0.2));
                const openRate = (opened / sent) * 100;
                const clickRate = (clicked / opened) * 100;

                const statuses: Array<'draft' | 'scheduled' | 'sent' | 'active'> = ['draft', 'scheduled', 'sent', 'active'];

                return {
                    id: `campaign-${idx + 1}`,
                    name: [
                        'حملة العروض الشهرية',
                        'نشرة المنتجات الجديدة',
                        'تحديثات الخدمات',
                        'عروض نهاية الموسم',
                        'دعوة للندوة',
                        'محتوى تعليمي',
                        'استبيان العملاء',
                        'إعلان الشراكة',
                        'نصائح وإرشادات',
                        'تحديثات الشركة',
                        'عروض خاصة VIP',
                        'رسالة شكر'
                    ][idx],
                    subject: `موضوع الحملة ${idx + 1}`,
                    status: statuses[idx % 4],
                    recipients,
                    sent,
                    opened,
                    clicked,
                    open_rate: openRate,
                    click_rate: clickRate,
                    scheduled_date: idx % 4 === 1 ? new Date(Date.now() + idx * 86400000).toISOString() : undefined,
                    sent_date: idx % 4 === 2 || idx % 4 === 3 ? new Date(Date.now() - idx * 86400000).toISOString() : undefined
                };
            });

            setCampaigns(mockCampaigns);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalCampaigns: campaigns.length,
        totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
        totalOpened: campaigns.reduce((sum, c) => sum + c.opened, 0),
        totalClicked: campaigns.reduce((sum, c) => sum + c.clicked, 0),
        avgOpenRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.open_rate, 0) / campaigns.length : 0,
        avgClickRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.click_rate, 0) / campaigns.length : 0
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'scheduled': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'sent': return 'مرسلة';
            case 'active': return 'نشطة';
            case 'scheduled': return 'مجدولة';
            default: return 'مسودة';
        }
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
                        <Mail className="w-8 h-8 text-primary" />
                        حملات البريد الإلكتروني
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إدارة ومتابعة حملات البريد</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    حملة جديدة
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي الحملات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalSent / 1000).toFixed(1)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">رسائل مرسلة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Eye className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalOpened / 1000).toFixed(1)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">تم فتحها</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <MousePointer className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalClicked}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">نقرات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgOpenRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل الفتح</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgClickRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل النقر</div>
                </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                    {campaign.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.subject}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                                {getStatusLabel(campaign.status)}
                            </span>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">المرسلة</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {campaign.sent}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">تم الفتح</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {campaign.opened}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">معدل الفتح</div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {campaign.open_rate.toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">معدل النقر</div>
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {campaign.click_rate.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        {campaign.sent_date && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                تم الإرسال: {new Date(campaign.sent_date).toLocaleDateString('ar-EG')}
                            </div>
                        )}
                        {campaign.scheduled_date && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                مجدولة: {new Date(campaign.scheduled_date).toLocaleDateString('ar-EG')}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" />
                                عرض
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                <Edit className="w-3 h-3" />
                                تعديل
                            </button>
                            <button className="px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
