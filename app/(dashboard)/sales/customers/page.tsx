"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Users,
    Building2,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Calendar,
    TrendingUp,
    Search,
    Plus,
    Eye,
    Edit,
    Star
} from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    location?: string;
    total_value: number;
    deals_count: number;
    last_contact?: string;
    status: 'active' | 'inactive' | 'potential';
    rating: number;
}

export default function CustomerManagementPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: deals } = await supabase
                .from('deals')
                .select('*');

            // Group deals by customer
            const customerMap = new Map<string, Customer>();

            deals?.forEach((deal, idx) => {
                const customerName = deal.customer_name || `عميل ${idx + 1}`;

                if (!customerMap.has(customerName)) {
                    customerMap.set(customerName, {
                        id: `cust-${customerMap.size + 1}`,
                        name: deal.customer_name || `عميل ${idx + 1}`, // contact_name does not exist on deals
                        company: deal.customer_company || customerName,
                        email: `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                        phone: `+20 ${1000000000 + customerMap.size}`,
                        location: ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة'][customerMap.size % 4],
                        total_value: deal.value || 0,
                        deals_count: 1,
                        last_contact: deal.created_at,
                        status: ['active', 'inactive', 'potential'][customerMap.size % 3] as any,
                        rating: 3 + Math.floor(Math.random() * 3)
                    });
                } else {
                    const customer = customerMap.get(customerName)!;
                    customer.total_value += deal.value || 0;
                    customer.deals_count += 1;
                }
            });

            setCustomers(Array.from(customerMap.values()));
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm ||
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        potential: customers.filter(c => c.status === 'potential').length,
        totalValue: customers.reduce((sum, c) => sum + c.total_value, 0),
        avgValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.total_value, 0) / customers.length : 0
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'potential': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'potential': return 'محتمل';
            default: return 'غير نشط';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل العملاء...</p>
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
                        إدارة العملاء
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">قاعدة بيانات العملاء والتفاعلات</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    عميل جديد
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي العملاء</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">عملاء نشطون</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Star className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.potential}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">عملاء محتملون</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي القيمة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(stats.avgValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط القيمة</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن عميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="potential">محتمل</option>
                    <option value="inactive">غير نشط</option>
                </select>
            </div>

            {/* Customers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <div
                        key={customer.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{customer.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.company}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                                {getStatusLabel(customer.status)}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                            </div>
                            {customer.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {customer.location}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">القيمة الإجمالية</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {(customer.total_value / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">عدد الصفقات</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {customer.deals_count}
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < customer.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" />
                                عرض
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                                <Edit className="w-3 h-3" />
                                تعديل
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
