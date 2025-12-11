"use client";

import { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    Users,
    Download,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

export default function PayrollPage() {
    const [selectedMonth, setSelectedMonth] = useState('2024-12');

    const payrollData = {
        month: 'December 2024',
        total_employees: 6,
        total_salaries: 150000,
        total_commissions: 45000,
        total_bonuses: 12000,
        total_deductions: 15000,
        net_payroll: 192000,
        status: 'pending'
    };

    const employees = [
        { id: '1', name: 'Ahmed Hassan', base: 25000, commission: 15000, bonus: 3000, deductions: 2500, net: 40500, status: 'pending' },
        { id: '2', name: 'Sarah Mohamed', base: 28000, commission: 0, bonus: 2000, deductions: 3000, net: 27000, status: 'approved' },
        { id: '3', name: 'Omar Khalid', base: 22000, commission: 12000, bonus: 2000, deductions: 2000, net: 34000, status: 'pending' },
        { id: '4', name: 'Fatima Ali', base: 26000, commission: 8000, bonus: 1500, deductions: 2500, net: 33000, status: 'approved' },
        { id: '5', name: 'Mohamed Saeed', base: 35000, commission: 0, bonus: 3500, deductions: 4000, net: 34500, status: 'pending' },
        { id: '6', name: 'Laila Ibrahim', base: 24000, commission: 10000, bonus: 0, deductions: 1000, net: 33000, status: 'pending' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Payroll Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Process monthly salaries and commissions</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="2024-12">December 2024</option>
                        <option value="2024-11">November 2024</option>
                        <option value="2024-10">October 2024</option>
                    </select>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                        Process Payroll
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Base Salaries</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                        ${(payrollData.total_salaries / 1000).toFixed(0)}K
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Commissions</div>
                    <div className="text-2xl font-black text-blue-600">
                        ${(payrollData.total_commissions / 1000).toFixed(0)}K
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-xs text-green-700 dark:text-green-400 mb-1">Bonuses</div>
                    <div className="text-2xl font-black text-green-600">
                        ${(payrollData.total_bonuses / 1000).toFixed(0)}K
                    </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Net Payroll</div>
                    <div className="text-2xl font-black text-purple-600">
                        ${(payrollData.net_payroll / 1000).toFixed(0)}K
                    </div>
                </div>
            </div>

            {/* Employee Payroll Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="font-bold">Employee Payroll - {payrollData.month}</h2>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                        Pending Approval
                    </span>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Base</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Commission</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Bonus</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Deductions</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Net</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                <td className="py-3 px-4 text-right">${emp.base.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-blue-600 font-medium">${emp.commission.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-green-600">${emp.bonus.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-red-600">-${emp.deductions.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-lg font-black text-purple-600">${emp.net.toLocaleString()}</td>
                                <td className="py-3 px-4 text-center">
                                    {emp.status === 'pending' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3 inline" /></span>}
                                    {emp.status === 'approved' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3 inline" /></span>}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-900 font-bold">
                            <td className="py-3 px-4">TOTAL</td>
                            <td className="py-3 px-4 text-right">${payrollData.total_salaries.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-blue-600">${payrollData.total_commissions.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-green-600">${payrollData.total_bonuses.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-red-600">-${payrollData.total_deductions.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-xl font-black text-purple-600">${payrollData.net_payroll.toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-bold mb-4">Payment History (Last 6 Months)</h2>
                <div className="grid md:grid-cols-6 gap-4">
                    {['Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul'].map((month, idx) => (
                        <div key={month} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">{month} 2024</div>
                            <div className="text-lg font-black text-gray-900 dark:text-white">
                                ${(192 - idx * 5)}K
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
