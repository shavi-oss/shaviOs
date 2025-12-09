"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface Commission {
    id: string;
    employee_id: string;
    amount: number;
    currency: string;
    type: 'deal_commission' | 'bonus' | 'quarterly_target';
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    pay_period: string;
    notes: string;
    created_at: string;
    employee?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    deal?: {
        title: string;
        value: number;
    };
}

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPaid: 0,
        pendingAmount: 0,
        thisMonth: 0,
        totalCount: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchCommissions();
    }, []);

    async function fetchCommissions() {
        try {
            const supabase = createClient();

            // Fetch Commissions with related data
            const { data, error } = await supabase
                .from('commissions')
                .select(`
                    *,
                    employee:employees(first_name, last_name, email),
                    deal:deals(title, value)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.log('Commissions table might not exist yet');
            } else {
                const comms = data as any[] || [];
                setCommissions(comms);

                // Calculate Stats
                const totalPaid = comms
                    .filter(c => c.status === 'paid')
                    .reduce((sum, c) => sum + Number(c.amount), 0);

                const pendingAmount = comms
                    .filter(c => c.status === 'pending')
                    .reduce((sum, c) => sum + Number(c.amount), 0);

                const now = new Date();
                const currentPeriod = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // e.g., "Dec 2025" or close match
                // Just simplify "this month" logic to created_at
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const thisMonth = comms
                    .filter(c => c.created_at >= startOfMonth && c.status !== 'cancelled')
                    .reduce((sum, c) => sum + Number(c.amount), 0);

                setStats({
                    totalPaid,
                    pendingAmount,
                    thisMonth,
                    totalCount: comms.length
                });
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredCommissions = commissions.filter(c => {
        const matchesSearch =
            c.employee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.employee?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            paid: 'تم الدفع',
            approved: 'معتمدة',
            pending: 'قيد الانتظار',
            cancelled: 'ملغاة'
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            deal_commission: 'عمولة صفقة',
            bonus: 'مكافأة',
            quarterly_target: 'هدف ربع سنوي'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل العمولات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">العمولات والمكافآت</h1>
                <p className="text-muted-foreground mt-2">تتبع صرف عمولات فريق المبيعات</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="العمولات المدفوعة"
                    value={`${stats.totalPaid.toLocaleString()} ج.م`}
                    icon={DollarSign}
                    description="إجمالي ما تم صرفه"
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="قيد الانتظار"
                    value={`${stats.pendingAmount.toLocaleString()} ج.م`}
                    icon={Clock}
                    description="بانتظار التحصيل أو الموافقة"
                />
                <StatCard
                    title="استحقاق هذا الشهر"
                    value={`${stats.thisMonth.toLocaleString()} ج.م`}
                    icon={Calendar}
                    description="عمولات الشهر الحالي"
                />
                <StatCard
                    title="عدد العمليات"
                    value={stats.totalCount}
                    icon={Users}
                    description="عملية مسجلة"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث باسم الموظف أو الملاحظات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="paid">تم الدفع</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="approved">معتمدة</option>
                        <option value="cancelled">ملغاة</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع / البيان</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفترة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCommissions.map((comm) => (
                            <tr key={comm.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {comm.employee?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {comm.employee?.first_name} {comm.employee?.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">{comm.employee?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{getTypeLabel(comm.type)}</span>
                                        <span className="text-xs text-gray-500">{comm.notes}</span>
                                        {comm.deal && (
                                            <span className="text-xs text-blue-600 mt-1">
                                                🔖 {comm.deal.title}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {Number(comm.amount).toLocaleString()} {comm.currency}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {comm.pay_period}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                                        {getStatusLabel(comm.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredCommissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    لا توجد بيانات مطابقة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
