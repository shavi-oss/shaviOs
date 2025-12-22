
import { PayrollRecord, TrainerPayment } from '@/app/actions/payroll';
import { CheckCircle } from 'lucide-react';

export const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
        case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }
};

export const getStatusLabel = (status: string | null | undefined) => {
    switch (status) {
        case 'paid': return 'مدفوع';
        case 'processing': return 'قيد المعالجة';
        default: return 'قيد الانتظار';
    }
};

interface EmployeeRowProps {
    record: PayrollRecord;
    handlePay: (id: string) => void;
}

export const EmployeeRow = ({ record, handlePay }: EmployeeRowProps) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
            {record.employee_name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
            {record.employee?.department || '-'}
            <div className="text-xs text-gray-400">{record.employee?.position}</div>
        </td>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <td className="px-6 py-4 text-sm">{((record as any).base_salary || 0).toLocaleString()}</td>
        <td className="px-6 py-4 text-sm text-green-600">+{record?.bonuses?.toLocaleString()}</td>
        <td className="px-6 py-4 text-sm text-red-600">-{record?.total_deductions?.toLocaleString()}</td>
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
            {record?.net_salary?.toLocaleString()}
        </td>
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
);

interface TrainerRowProps {
    record: TrainerPayment;
    handlePay: (id: string) => void;
}

export const TrainerRow = ({ record, handlePay }: TrainerRowProps) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
            {record.trainer_name}
        </td>
        <td className="px-6 py-4 text-sm">
            {record.sessions_count} حصة
        </td>
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
            {(record.amount || 0).toLocaleString()} EGP
        </td>
        
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
);
