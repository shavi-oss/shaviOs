"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    UserPlus,
    Mail,
    Phone,
    GraduationCap,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    Ticket
} from 'lucide-react';

interface Student {
    id: string;
    full_name: string;
    email: string | null;
    phone?: string | null;
    status: 'active' | 'at_risk' | 'completed' | 'paused' | 'dropped';
    enrollment_date: string;
    progress?: number;
    last_activity?: string;
}

export default function StudentsListPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchStudents();
    }, [statusFilter]);

    async function fetchStudents() {
        setLoading(true);
        try {
            const supabase = createClient();
            let query = supabase
                .from('students')
                .select('*')
                .order('enrollment_date', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setStudents((data as unknown as Student[]) || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredStudents = students.filter(student => {
        const search = searchTerm.toLowerCase();
        return (
            (student.full_name || '').toLowerCase().includes(search) ||
            (student.email || '').toLowerCase().includes(search) ||
            (student.phone || '').toLowerCase().includes(search)
        );
    });

    const getStatusConfig = (status: string) => {
        const configs = {
            active: {
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: CheckCircle2,
                label: 'نشط'
            },
            at_risk: {
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: AlertTriangle,
                label: 'في خطر'
            },
            completed: {
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: GraduationCap,
                label: 'مكتمل'
            },
            paused: {
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: AlertTriangle,
                label: 'متوقف'
            },
            dropped: {
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: AlertTriangle,
                label: 'منسحب'
            },
        };
        return configs[status as keyof typeof configs] || configs.active;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الطلاب...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">الطلاب</h1>
                    <p className="text-muted-foreground mt-2">
                        {filteredStudents.length} طالب
                    </p>
                </div>
                <button
                    onClick={() => router.push('/customer-success/students/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    إضافة طالب جديد
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400">نشط</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {students.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400">في خطر</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {students.filter(s => s.status === 'at_risk').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">مكتمل</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {students.filter(s => s.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className=" p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg border border-gray-200 dark:border-gray-900/30">
                    <div className="flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي</p>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                {students.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="ابحث بالاسم، البريد الإلكتروني، أو الهاتف..."
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
                        <option value="active">نشط</option>
                        <option value="at_risk">في خطر</option>
                        <option value="completed">مكتمل</option>
                        <option value="paused">متوقف</option>
                        <option value="dropped">منسحب</option>
                    </select>
                </div>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا يوجد طلاب
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'لم يتم العثور على نتائج مطابقة' : 'ابدأ بإضافة طلاب جدد'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents.map((student) => {
                        const statusConfig = getStatusConfig(student.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={student.id}
                                className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-all cursor-pointer group"
                                onClick={() => router.push(`/customer-success/students/${student.id}`)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-primary font-medium text-lg">
                                                {student.full_name?.[0] || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                {student.full_name}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusConfig.color} mt-1`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    {student.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{student.email}</span>
                                        </div>
                                    )}
                                    {student.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="w-4 h-4 shrink-0" />
                                            {student.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {student.progress !== undefined && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            <span>التقدم</span>
                                            <span>{student.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Open message dialog
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        رسالة
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/customer-success/tickets/new?student_id=${student.id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        <Ticket className="w-4 h-4" />
                                        تذكرة
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
