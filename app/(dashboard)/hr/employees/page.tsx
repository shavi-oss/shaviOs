"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    Plus,
    Users,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    MoreVertical,
    UserCircle,
    Building2
} from 'lucide-react';

interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    position: string;
    department: 'management' | 'hr' | 'finance' | 'marketing' | 'sales' | 'customer_success' | 'tech' | 'trainers';
    join_date: string;
    status: 'active' | 'on_leave' | 'terminated' | 'resigned' | 'probation';
    created_at: string;
}

export default function EmployeesPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState<string>('all');

    useEffect(() => {
        fetchEmployees();
    }, [deptFilter]);

    async function fetchEmployees() {
        setLoading(true);
        try {
            const supabase = createClient();
            let query = supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (deptFilter !== 'all') {
                query = query.eq('department', deptFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.warn('Employees table might not exist yet:', error.message);
                setEmployees([]);
            } else {
                setEmployees(data || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredEmployees = employees.filter(employee =>
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status: string) => {
        const configs = {
            active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'نشط' },
            on_leave: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'إجازة' },
            probation: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'تحت الاختبار' },
            terminated: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'منهي' },
            resigned: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'مستقيل' },
        };
        return configs[status as keyof typeof configs] || configs.active;
    };

    const getDepartmentLabel = (dept: string) => {
        const labels: Record<string, string> = {
            management: 'الإدارة',
            hr: 'الموارد البشرية',
            finance: 'المالية',
            marketing: 'التسويق',
            sales: 'المبيعات',
            customer_success: 'نجاح العملاء',
            tech: 'التقنية',
            trainers: 'المدربين'
        };
        return labels[dept] || dept;
    };

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        on_leave: employees.filter(e => e.status === 'on_leave').length,
        departments: new Set(employees.map(e => e.department)).size
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الموظفين...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">الموظفين</h1>
                    <p className="text-muted-foreground mt-2">
                        دليل الموظفين وإدارة الفريق
                    </p>
                </div>
                <button
                    onClick={() => router.push('/hr/employees/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    إضافة موظف
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">إجمالي الموظفين</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <UserCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">نشط</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">في إجازة</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.on_leave}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">الأقسام</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.departments}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث بالاسم، البريد الإلكتروني، أو المسمى الوظيفي..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">جميع الأقسام</option>
                        <option value="management">الإدارة</option>
                        <option value="hr">الموارد البشرية</option>
                        <option value="finance">المالية</option>
                        <option value="marketing">التسويق</option>
                        <option value="sales">المبيعات</option>
                        <option value="customer_success">نجاح العملاء</option>
                        <option value="tech">التقنية</option>
                        <option value="trainers">المدربين</option>
                    </select>
                </div>
            </div>

            {/* Employees Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        لا يوجد موظفين مطابقين للبحث
                    </div>
                ) : (
                    filteredEmployees.map((employee) => {
                        const statusConfig = getStatusConfig(employee.status);
                        return (
                            <div key={employee.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                                            {employee.first_name[0]}{employee.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                                                {employee.first_name} {employee.last_name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                                {employee.position}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate" title={employee.email}>{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{employee.phone || 'غير متوفر'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span>{getDepartmentLabel(employee.department)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>انضم: {new Date(employee.join_date).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>

                                <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                                    <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
