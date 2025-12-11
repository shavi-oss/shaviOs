"use client";

import { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Users,
    Filter,
    Download
} from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
    id: string;
    employee_name: string;
    employee_id: string;
    leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid';
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    sla_due: string;
    submitted_at: string;
}

export default function LeaveManagementPage() {
    const [filter, setFilter] = useState('all');

    const requests: LeaveRequest[] = [
        {
            id: '1',
            employee_name: 'Ahmed Hassan',
            employee_id: '1',
            leave_type: 'annual',
            start_date: '2024-12-20',
            end_date: '2024-12-27',
            days_count: 7,
            reason: 'Family vacation',
            status: 'pending',
            sla_due: new Date(Date.now() + 5 * 3600000).toISOString(),
            submitted_at: '2024-12-10'
        },
        {
            id: '2',
            employee_name: 'Fatima Ali',
            employee_id: '4',
            leave_type: 'sick',
            start_date: '2024-12-11',
            end_date: '2024-12-12',
            days_count: 2,
            reason: 'Medical checkup',
            status: 'approved',
            sla_due: '',
            submitted_at: '2024-12-09'
        },
        {
            id: '3',
            employee_name: 'Omar Khalid',
            employee_id: '3',
            leave_type: 'emergency',
            start_date: '2024-12-15',
            end_date: '2024-12-15',
            days_count: 1,
            reason: 'Family emergency',
            status: 'pending',
            sla_due: new Date(Date.now() + 2 * 3600000).toISOString(),
            submitted_at: '2024-12-10'
        }
    ];

    const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length
    };

    const getTimeRemaining = (sla: string) => {
        if (!sla) return '';
        const diff = new Date(sla).getTime() - Date.now();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);

        if (diff < 0) return 'Overdue';
        if (hours < 1) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    const getSLAColor = (sla: string) => {
        if (!sla) return '';
        const diff = new Date(sla).getTime() - Date.now();
        if (diff < 0) return 'text-red-600';
        if (diff < 3600000) return 'text-orange-600';
        return 'text-green-600';
    };

    const getLeaveTypeBadge = (type: string) => {
        const badges = {
            annual: 'bg-blue-100 text-blue-700',
            sick: 'bg-red-100 text-red-700',
            emergency: 'bg-orange-100 text-orange-700',
            unpaid: 'bg-gray-100 text-gray-700'
        };
        return badges[type as keyof typeof badges] || badges.annual;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                        Leave Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Approve, reject, and track employee leave requests</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link href="/hr/leave/request" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                        Request Leave
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Requests</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.pending}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Pending</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.approved}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Approved</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.rejected}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">Rejected</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold">Filter:</span>
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Dates</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Days</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">SLA</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(request => (
                            <tr key={request.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="py-3 px-4">
                                    <Link href={`/hr/employees/${request.employee_id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary">
                                        {request.employee_name}
                                    </Link>
                                    <div className="text-xs text-gray-500">Submitted {request.submitted_at}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${getLeaveTypeBadge(request.leave_type)}`}>
                                        {request.leave_type}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-center font-bold">{request.days_count}</td>
                                <td className="py-3 px-4">
                                    {request.status === 'pending' && request.sla_due && (
                                        <span className={`flex items-center gap-1 text-sm font-bold ${getSLAColor(request.sla_due)}`}>
                                            <Clock className="w-3 h-3" />
                                            {getTimeRemaining(request.sla_due)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {request.status === 'pending' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Pending</span>}
                                    {request.status === 'approved' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Approved</span>}
                                    {request.status === 'rejected' && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Rejected</span>}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    {request.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                                                ✓ Approve
                                            </button>
                                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
