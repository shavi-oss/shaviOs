"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Users,
    TrendingUp,
    Phone,
    Mail,
    Calendar,
    Star,
    Filter,
    Download,
    Plus,
    Eye,
    Edit,
    MessageSquare
} from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    score: number;
    value: number;
    created_at: string;
    last_contact?: string | null;
}

export default function MarketingLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSource, setFilterSource] = useState<string>('all');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Fetch deals to create leads from
            const { data: deals } = await supabase
                .from('deals')
                .select('*')
                .limit(20);

            // Generate mock leads from deals
            const mockLeads: Lead[] = deals?.map((deal, idx) => ({
                id: `lead-${idx + 1}`,
                name: deal.customer_name || `عميل ${idx + 1}`,
                email: `customer${idx + 1}@example.com`,
                phone: `+20 ${1000000000 + idx}`,
                company: deal.customer_name || 'شركة',
                source: ['website', 'referral', 'social', 'email', 'ads'][idx % 5],
                status: ['new', 'contacted', 'qualified', 'converted', 'lost'][idx % 5] as any,
                score: 20 + Math.floor(Math.random() * 80),
                value: deal.value || 0,
                created_at: deal.created_at,
                last_contact: idx % 2 === 0 ? new Date(Date.now() - idx * 86400000).toISOString() : undefined
            })) || [];

            setLeads(mockLeads);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        const matchesSource = filterSource === 'all' || lead.source === filterSource;
        return matchesStatus && matchesSource;
    });

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        converted: leads.filter(l => l.status === 'converted').length,
        avgScore: leads.length > 0 ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length : 0,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            new: 'جديد',
            contacted: 'تم التواصل',
            qualified: 'مؤهل',
            converted: 'محول',
            lost: 'مفقود'
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            qualified: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    const getSourceLabel = (source: string) => {
        const labels = {
            website: 'موقع إلكتروني',
            referral: 'إحالة',
            social: 'وسائل تواصل',
            email: 'بريد إلكتروني',
            ads: 'إعلانات'
        };
        return labels[source as keyof typeof labels] || source;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 50) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل العملاء المحتملين...</p>
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
                        <Users className="w-8 h-8 text-primary" />
                        العملاء المحتملين
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إدارة ومتابعة العملاء المحتملين</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        عميل جديد
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي العملاء</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Star className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">جديد</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.qualified}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مؤهل</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Star className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.converted}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">محول</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore.toFixed(0)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط النقاط</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversionRate.toFixed(0)}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل التحويل</div>
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
                    <option value="new">جديد</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="qualified">مؤهل</option>
                    <option value="converted">محول</option>
                    <option value="lost">مفقود</option>
                </select>

                <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">كل المصادر</option>
                    <option value="website">موقع إلكتروني</option>
                    <option value="referral">إحالة</option>
                    <option value="social">وسائل تواصل</option>
                    <option value="email">بريد إلكتروني</option>
                    <option value="ads">إعلانات</option>
                </select>
            </div>

            {/* Leads Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الشركة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المصدر</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">النقاط</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">القيمة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        لا توجد عملاء محتملين
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {lead.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {lead.company}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {getSourceLabel(lead.source)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${lead.score >= 80 ? 'bg-green-500' : lead.score >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                        style={{ width: `${lead.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                                                    {lead.score}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {(lead.value / 1000).toFixed(0)}K جنيه
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                                                {getStatusLabel(lead.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                                    <MessageSquare className="w-4 h-4 text-gray-400" />
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
