"use client";

import { useEffect, useState } from 'react';
import { getLeaveRequests, updateLeaveStatus, type LeaveRequest } from '@/app/actions/hr';
import { createClient } from '@/lib/supabase/client';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    User,
    Loader2
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons';
import { NewLeaveModal } from './new-leave-modal';

const leaveTypes = [
    { value: 'annual', label: 'إجازة سنوية', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { value: 'sick', label: 'إجازة مرضية', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { value: 'emergency', label: 'إجازة طارئة', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { value: 'unpaid', label: 'إجازة بدون راتب', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
    { value: 'maternity', label: 'إجازة وضع', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
    { value: 'paternity', label: 'إجازة أبوة', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
];

export default function HRLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);

    // User Context
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchUserProfile();
        loadLeaves();
    }, [currentPage, filterStatus]);

    const fetchUserProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            // Fetch role from profiles table (more secure than metadata for UI conditional)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setUserRole(profile?.role || 'user');
        }
    };

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const { data, totalPages: pages, count } = await getLeaveRequests(currentPage, 10, filterStatus);
            setLeaves(data);
            setTotalPages(pages);
            setTotalCount(count);
        } catch (err) {
            toast.error('فشل في تحميل طلبات الإجازات');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            await updateLeaveStatus(id, newStatus);
            toast.success(newStatus === 'approved' ? 'تمت الموافقة بنجاح' : 'تم الرفض بنجاح');
            loadLeaves(); // Refresh
        } catch (err) {
            toast.error('فشل في تحديث الحالة - تأكد من الرصيد والصلاحيات');
        }
    };

    const isManagerOrAdmin = () => {
        return ['admin', 'manager', 'hr', 'hr_manager', 'general_manager'].includes(userRole || '');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-orange-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'موافق عليها';
            case 'rejected': return 'مرفوضة';
            case 'cancelled': return 'ملغاة';
            default: return 'قيد المراجعة';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        return leaveTypes.find(t => t.value === type)?.label || type;
    };

    const getLeaveTypeColor = (type: string) => {
        return leaveTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-primary" />
                        إدارة الإجازات
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {totalCount}
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة وإدارة طلبات الإجازات</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowNewLeaveModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        طلب إجازة جديد
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    تصفية حسب الحالة:
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1); // Reset page on filter change
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                >
                    <option value="all">كل الحالات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="approved">موافق عليها</option>
                    <option value="rejected">مرفوضة</option>
                </select>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-6">
                        <TableSkeleton rows={5} columns={7} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الموظف</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">نوع الإجازة</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">من</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إلى</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الأيام</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {leaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>لا توجد طلبات إجازة تطابق البحث</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {leave.employee.first_name} {leave.employee.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {leave.department || 'غير محدد'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeaveTypeColor(leave.type)}`}>
                                                        {getLeaveTypeLabel(leave.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(leave.start_date).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(leave.end_date).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900 dark:text-white">{leave.days}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(leave.status)}
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                                                            {getStatusLabel(leave.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {leave.status === 'pending' && isManagerOrAdmin() ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                                                className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                            >
                                                                موافقة
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                                                className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                            >
                                                                رفض
                                                            </button>
                                                        </div>
                                                    ) : leave.status === 'pending' ? (
                                                        <span className="text-xs text-gray-400">في انتظار المراجعة</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            تم الرد بواسطة {leave.status === 'approved' ? 'الإدارة' : 'الإدارة'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* New Leave Modal */}
            <NewLeaveModal
                open={showNewLeaveModal}
                onClose={() => setShowNewLeaveModal(false)}
                onSuccess={() => {
                    loadLeaves();
                }}
            />
        </div>
    );
}
