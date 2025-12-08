"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    UserPlus,
    Phone,
    Mail,
    Building2,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    source: string;
    created_at: string;
    total_score?: number;
    temperature?: 'hot' | 'warm' | 'cold';
}

export default function LeadsListPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');

    useEffect(() => {
        fetchLeads();
    }, [statusFilter, sourceFilter]);

    async function fetchLeads() {
        setLoading(true);
        try {
            const supabase = createClient();

            // Check if client was created successfully
            if (!supabase) {
                console.error('Supabase client creation failed');
                throw new Error('Supabase client is null');
            }

            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (sourceFilter !== 'all') {
                query = query.eq('source', sourceFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('Leads fetched successfully:', data?.length || 0, 'leads');
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            // Check env variables
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!');
            }
            if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!');
            }
        } finally {
            setLoading(false);
        }
    }

    const filteredLeads = leads.filter(lead => {
        const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || lead.email?.toLowerCase().includes(search);
    });

    const getStatusColor = (status: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            qualified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            converted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            lost: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return colors[status as keyof typeof colors] || colors.new;
    };

    const getTemperatureIcon = (temp?: 'hot' | 'warm' | 'cold') => {
        if (temp === 'hot') return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (temp === 'warm') return <Minus className="w-4 h-4 text-orange-500" />;
        if (temp === 'cold') return <TrendingDown className="w-4 h-4 text-blue-500" />;
        return null;
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">العملاء المحتملين</h1>
                    <p className="text-muted-foreground mt-2">
                        {filteredLeads.length} عميل محتمل
                    </p>
                </div>
                <button
                    onClick={() => router.push('/marketing/leads/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    إضافة عميل جديد
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="new">جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="qualified">مؤهل</option>
                        <option value="converted">محول</option>
                        <option value="lost">مفقود</option>
                    </select>
                </div>

                {/* Source Filter */}
                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">جميع المصادر</option>
                    <option value="nazmly">Nazmly</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="website">الموقع الإلكتروني</option>
                    <option value="manual">يدوي</option>
                </select>
            </div>

            {/* Leads Table */}
            {filteredLeads.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا توجد عملاء محتملين
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'لم يتم العثور على نتائج مطابقة' : 'ابدأ بإضافة عملاء محتملين جدد'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الاسم</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">معلومات الاتصال</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الشركة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">النقاط</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المصدر</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => router.push(`/marketing/leads/${lead.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <span className="text-primary font-medium">
                                                        {lead.first_name[0]}{lead.last_name[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {lead.first_name} {lead.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Mail className="w-4 h-4" />
                                                        {lead.email}
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Phone className="w-4 h-4" />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.company && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Building2 className="w-4 h-4" />
                                                    {lead.company}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getTemperatureIcon(lead.temperature)}
                                                <span className="text-sm font-medium">
                                                    {lead.total_score || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                                {lead.status === 'new' && 'جديد'}
                                                {lead.status === 'contacted' && 'تم التواصل'}
                                                {lead.status === 'qualified' && 'مؤهل'}
                                                {lead.status === 'converted' && 'محول'}
                                                {lead.status === 'lost' && 'مفقود'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {lead.source}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(lead.created_at).toLocaleDateString('ar-EG')}
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
