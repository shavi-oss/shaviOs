"use client";

import { useEffect, useState } from 'react';
import { 
    getPayrollRecords, 
    getTrainerPayments,
    generatePayrollForMonth, 
    paySingleEmployee, 
    paySingleTrainer,
    type PayrollRecord,
    type TrainerPayment
} from '@/app/actions/payroll';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import {
    DollarSign,
    Users,
    Download,
    CheckCircle,
    Clock,
    Play,
    Loader2,
    Briefcase,
    GraduationCap
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons';

export default function HRPayrollPage() {
    // State
    const [activeTab, setActiveTab] = useState<'employees' | 'trainers'>('employees');
    const [employeePayroll, setEmployeePayroll] = useState<PayrollRecord[]>([]);
    const [trainerPayroll, setTrainerPayroll] = useState<TrainerPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Stats
    const [stats, setStats] = useState({
        totalAmount: 0,
        paidCount: 0,
        pendingCount: 0
    });

    useEffect(() => {
        loadPayroll();
    }, [selectedMonth, filterStatus, filterDepartment, currentPage, activeTab]);

    const loadPayroll = async () => {
        try {
            setLoading(true);
            
            if (activeTab === 'employees') {
                const { data, count, totalPages: pages } = await getPayrollRecords(
                    selectedMonth,
                    filterDepartment,
                    filterStatus,
                    currentPage
                );
                setEmployeePayroll(data);
                setTotalCount(count);
                setTotalPages(pages);

                const total = data.reduce((sum, p) => sum + (p.net_salary || 0), 0);
                setStats({
                    totalAmount: total,
                    paidCount: data.filter(p => p.status === 'paid').length,
                    pendingCount: data.filter(p => p.status === 'pending').length
                });

            } else {
                const { data, count, totalPages: pages } = await getTrainerPayments(
                    selectedMonth,
                    filterStatus,
                    currentPage
                );
                setTrainerPayroll(data);
                setTotalCount(count);
                setTotalPages(pages);
                
                const total = data.reduce((sum, p) => sum + (p.amount || 0), 0);
                setStats({
                    totalAmount: total,
                    paidCount: data.filter(p => p.status === 'paid').length,
                    pendingCount: data.filter(p => p.status === 'pending').length
                });
            }

        } catch (err) {
            console.error(err);
            toast.error('فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generatePayrollForMonth(selectedMonth);
            if (result.success) {
                toast.success(result.message);
                loadPayroll();
            } else {
                toast.warning(result.message); // Warning if already exists
            }
        } catch (err) {
            toast.error('حدث خطأ أثناء إنشاء الرواتب');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePay = async (id: string) => {
        try {
            if (activeTab === 'employees') {
                await paySingleEmployee(id);
            } else {
                await paySingleTrainer(id);
            }
            toast.success('تم دفع الراتب بنجاح');
            loadPayroll();
        } catch (err) {
            toast.error('فشل في عملية الدفع');
        }
    };

    const exportToCSV = () => {
        // Simple export logic depending on tab
        const isEmp = activeTab === 'employees';
        const headers = isEmp 
            ? ['الموظف', 'المنصب', 'الراتب الأساسي', 'المكافآت', 'الخصومات', 'الصافي', 'الحالة', 'التاريخ']
            : ['المدرب', 'عدد الحصص', 'المبلغ', 'الحالة', 'ملاحظات', 'التاريخ'];
        
        const rows = isEmp
            ? employeePayroll.map(p => [
                p.employee_name,
                p.employee?.position || 'N/A',
                p.base_salary,
                p.bonuses,
                p.total_deductions,
                p.net_salary,
                p.status === 'paid' ? 'مدفوع' : 'معلق',
                p.created_at ? p.created_at.split('T')[0] : ''
            ])
            : trainerPayroll.map(p => [
                p.trainer_name,
                p.sessions_count,
                p.amount,
                p.status === 'paid' ? 'مدفوع' : 'معلق',
                p.notes,
                p.created_at ? p.created_at.split('T')[0] : ''
            ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payroll-${activeTab}-${selectedMonth}.csv`;
        link.click();
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        }
    };

    const getStatusLabel = (status: string | null) => {
        switch (status) {
            case 'paid': return 'مدفوع';
            case 'processing': return 'قيد المعالجة';
            default: return 'قيد الانتظار';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-primary" />
                        الرواتب والأجور
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {selectedMonth}
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إدارة كشوف المرتبات الشهرية</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        إنشاء كشف الشهر
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('employees')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                        activeTab === 'employees' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    الموظفين
                </button>
                <button
                    onClick={() => setActiveTab('trainers')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                        activeTab === 'trainers' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    المدربين
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">إجمالي المستحق</span>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalAmount / 1000).toFixed(1)}k</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">العدد</span>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">تم الدفع</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paidCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">معلق</span>
                        <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingCount}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px]">
                {loading ? (
                    <div className="p-8">
                        <TableSkeleton rows={5} columns={8} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        {activeTab === 'employees' ? (
                                            <>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الموظف</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">القسم</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الأساسي</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المكافآت</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الخصومات</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الصافي</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المدرب</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">عدد الحصص</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المستحق</th>
                                            </>
                                        )}
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {(activeTab === 'employees' ? employeePayroll : trainerPayroll).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>لا توجد بيانات ({selectedMonth})</p>
                                                    <p className="text-sm mt-2">اضغط على "إنشاء كشف الشهر"</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        (activeTab === 'employees' ? employeePayroll : trainerPayroll).map((record: any) => (
                                            <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                {activeTab === 'employees' ? (
                                                    <>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                            {record.employee_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {record.employee?.department || '-'}
                                                            <div className="text-xs text-gray-400">{record.employee?.position}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">{(record.base_salary || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm text-green-600">+{record.bonuses.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm text-red-600">-{ (record.total_deductions || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                            {(record.net_salary || 0).toLocaleString()}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                            {record.trainer_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {record.sessions_count} حصة
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                            {(record.amount || 0).toLocaleString()} EGP
                                                        </td>
                                                    </>
                                                )}
                                                
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                                        {getStatusLabel(record.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.status === 'pending' && (
                                                        <button
                                                            onClick={() => handlePay(record.id)}
                                                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                                                        >
                                                            تسليم
                                                        </button>
                                                    )}
                                                    {record.status === 'paid' && (
                                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> تم
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
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
        </div>
    );
}
