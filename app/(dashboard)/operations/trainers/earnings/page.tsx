"use client";

import { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    CheckCircle,
    Clock,
    Download
} from 'lucide-react';

export default function EarningsPage() {
    const [selectedMonth, setSelectedMonth] = useState('december');

    const earnings = [
        { id: '1', session: 'Advanced JavaScript', date: '2024-12-11', students: 12, commission: 3600, status: 'approved' },
        { id: '2', session: 'React Fundamentals', date: '2024-12-10', students: 15, commission: 4500, status: 'approved' },
        { id: '3', session: 'Python for Data Science', date: '2024-12-09', students: 10, commission: 3000, status: 'pending' },
        { id: '4', session: 'Web Development Bootcamp', date: '2024-12-08', students: 18, commission: 5400, status: 'approved' },
        { id: '5', session: 'Advanced JavaScript', date: '2024-12-07', students: 11, commission: 3300, status: 'paid' }
    ];

    const monthly = [
        { month: 'December', total: 45000, approved: 35000, paid: 25000, pending: 10000 },
        { month: 'November', total: 52000, approved: 52000, paid: 52000, pending: 0 },
        { month: 'October', total: 48000, approved: 48000, paid: 48000, pending: 0 }
    ];

    const stats = {
        total_this_month: earnings.reduce((sum, e) => sum + e.commission, 0),
        approved: earnings.filter(e => e.status === 'approved' || e.status === 'paid').reduce((sum, e) => sum + e.commission, 0),
        pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commission, 0),
        paid: earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.commission, 0),
        sessions: earnings.length,
        rate: 300 // per student
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Earnings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Track your commissions and payments</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">${(stats.total_this_month / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Total This Month</div>
                </div>
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">${(stats.approved / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Approved</div>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">${(stats.pending / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Pending</div>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">{stats.sessions}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Sessions</div>
                </div>
            </div>

            {/* Commission Rate Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                        <div className="font-bold text-blue-800 dark:text-blue-400">Commission Rate</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            ${stats.rate} per student per session
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold">Earnings Breakdown</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Session</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Students</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Commission</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {earnings.map(earning => (
                            <tr key={earning.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{earning.session}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(earning.date).toISOString().split('T')[0]}
                                </td>
                                <td className="py-3 px-4 text-center text-sm font-bold">{earning.students}</td>
                                <td className="py-3 px-4 text-right text-lg font-black text-green-600">
                                    ${earning.commission.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 ${earning.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            earning.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {earning.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                                        {earning.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-900 font-bold">
                        <tr>
                            <td className="py-3 px-4" colSpan={3}>Total</td>
                            <td className="py-3 px-4 text-right text-xl text-green-600">
                                ${stats.total_this_month.toLocaleString()}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Monthly History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Monthly History</h2>
                <div className="space-y-3">
                    {monthly.map((m, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-bold text-gray-900 dark:text-white">{m.month} 2024</div>
                                <div className="text-xl font-black text-green-600">${(m.total / 1000).toFixed(0)}K</div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Approved:</span>
                                    <span className="font-bold text-blue-600 ml-1">${(m.approved / 1000).toFixed(0)}K</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Paid:</span>
                                    <span className="font-bold text-green-600 ml-1">${(m.paid / 1000).toFixed(0)}K</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pending:</span>
                                    <span className="font-bold text-orange-600 ml-1">${(m.pending / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
