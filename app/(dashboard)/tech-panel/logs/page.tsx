"use client";

import { useState } from 'react';
import {
    Search,
    Filter,
    AlertCircle,
    CheckCircle,
    Info,
    Clock,
    Download
} from 'lucide-react';

// Mock Data for System Logs
const MOCK_LOGS = [
    { id: 1, action: "User Login", user: "Admin User", module: "Auth", status: "success", timestamp: "2025-12-09 10:30:15", details: "Successful login via Email" },
    { id: 2, action: "Create Lead", user: "Sarah Sales", module: "Marketing", status: "success", timestamp: "2025-12-09 11:15:22", details: "Added new lead: Ahmed Mohamed" },
    { id: 3, action: "Update Deal", user: "Sarah Sales", module: "Sales", status: "success", timestamp: "2025-12-09 11:45:00", details: "Moved deal to 'Negotiation' stage" },
    { id: 4, action: "API Error", user: "System", module: "Integrations", status: "error", timestamp: "2025-12-09 12:05:11", details: "Failed to sync with Zapier (Timeout)" },
    { id: 5, action: "Export Report", user: "Admin User", module: "Finance", status: "success", timestamp: "2025-12-09 13:20:45", details: "Exported Monthly Revenue PDF" },
    { id: 6, action: "Bulk Import", user: "Manager", module: "Students", status: "warning", timestamp: "2025-12-09 14:10:33", details: "Imported 50 students. 2 duplicates skipped." },
    { id: 7, action: "Settings Change", user: "Admin User", module: "Settings", status: "success", timestamp: "2025-12-09 14:55:01", details: "Updated email notification preferences" },
    { id: 8, action: "User Logout", user: "Guest", module: "Auth", status: "success", timestamp: "2025-12-09 15:00:00", details: "Session expired" },
];

export default function LogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState('all');

    const filteredLogs = MOCK_LOGS.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = filterModule === 'all' || log.module === filterModule;

        return matchesSearch && matchesModule;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">سجلات النظام</h1>
                    <p className="text-muted-foreground mt-2">تتبع نشاط المستخدمين وأداء النظام (System Logs)</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-gray-800">
                    <Download className="w-4 h-4" />
                    <span>تصدير CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث في السجلات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                        <option value="all">كل الوحدات</option>
                        <option value="Auth">Auth (دخول/خروج)</option>
                        <option value="Sales">المبيعات</option>
                        <option value="Marketing">التسويق</option>
                        <option value="Integrations">Integrations</option>
                        <option value="Finance">المالية</option>
                        <option value="Students">الطلاب</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوقت</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحدث</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {log.timestamp}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{log.action}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">{log.details}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {log.user}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                        {log.module}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                        {getStatusIcon(log.status)}
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        لا توجد سجلات مطابقة للبحث
                    </div>
                )}
            </div>
        </div>
    );
}
