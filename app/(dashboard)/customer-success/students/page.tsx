"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents } from '@/app/actions/students';
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
    Ticket,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeletons';
import { toast } from 'sonner';

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
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 9; // Grid 3x3

    const fetchStudents = useCallback(async (currentPage: number) => {
        setLoading(true);
        try {
            const { data, count } = await getStudents(searchTerm, statusFilter, currentPage, limit);
            setStudents((data || []) as Student[]);
            setTotal(count);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students', {
                description: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
            fetchStudents(1);
        }, 300); 
        return () => clearTimeout(timer);
    }, [fetchStudents]);

    // Independent effect for page changes (skip if search triggered reset)
    useEffect(() => {
        fetchStudents(page);
    }, [page, fetchStudents]);

    const totalPages = Math.ceil(total / limit);

    const getStatusConfig = (status: string) => {
        const configs = {
            active: {
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: CheckCircle2,
                label: 'Active'
            },
            at_risk: {
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: AlertTriangle,
                label: 'At Risk'
            },
            completed: {
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: GraduationCap,
                label: 'Completed'
            },
            paused: {
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: AlertTriangle,
                label: 'Paused'
            },
            dropped: {
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: AlertTriangle,
                label: 'Dropped'
            },
        };
        return configs[status as keyof typeof configs] || configs.active;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
                    <p className="text-muted-foreground mt-2">
                        {total} Total Students • Showing Page {page} of {Math.max(1, totalPages)}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/customer-success/students/new')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New Student
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search by Name, Email, or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="at_risk">At Risk</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                    </select>
                </div>
            </div>

            {/* Students Grid */}
            {loading ? (
                <CardSkeleton count={6} />
            ) : students.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        {searchTerm ? `No results matching "${searchTerm}"` : 'Get started by adding your first student to the system.'}
                    </p>
                    {!searchTerm && (
                        <button 
                            onClick={() => router.push('/customer-success/students/new')}
                            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Add Student
                        </button>
                    )}
                </div>
            ) : (
                <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => {
                        const statusConfig = getStatusConfig(student.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={student.id}
                                className="group relative p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                                onClick={() => router.push(`/customer-success/students/${student.id}`)}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>

                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 h-12 w-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center border border-primary/10">
                                            <span className="text-primary font-bold text-lg">
                                                {student.full_name?.[0] || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {student.full_name}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${statusConfig.color} mt-1`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    {student.email ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            <span className="truncate">{student.email}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">No email provided</div>
                                    )}
                                    {student.phone && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            {student.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {student.progress !== undefined && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Academic Progress</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{student.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${student.progress > 75 ? 'bg-green-500' : student.progress > 40 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Open message dialog
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Message
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/customer-success/tickets/new?student_id=${student.id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <Ticket className="w-3.5 h-3.5" />
                                        New Ticket
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-800 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    );
}

