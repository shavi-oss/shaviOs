"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Calendar,
    Download,
    Filter,
    BarChart3,
    Users,
    DollarSign,
    TrendingUp,
    Save
} from 'lucide-react';

export default function CustomReportsPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        report_type: 'employee_performance',
        date_range: 'last_month',
        start_date: '',
        end_date: '',
        departments: [] as string[],
        metrics: ['performance', 'attendance', 'kpis'],
        format: 'excel',
        schedule: 'none'
    });

    const reportTypes = [
        { value: 'employee_performance', label: 'Employee Performance', icon: Users },
        { value: 'payroll_summary', label: 'Payroll Summary', icon: DollarSign },
        { value: 'leave_analysis', label: 'Leave Analysis', icon: Calendar },
        { value: 'kpi_tracking', label: 'KPI Tracking', icon: TrendingUp },
        { value: 'department_overview', label: 'Department Overview', icon: BarChart3 }
    ];

    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_quarter', label: 'Last Quarter' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const departments = ['Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Customer Success'];

    const metrics = [
        { value: 'performance', label: 'Performance Scores' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'kpis', label: 'KPI Achievement' },
        { value: 'payroll', label: 'Payroll Data' },
        { value: 'leave', label: 'Leave Balance' },
        { value: 'training', label: 'Training Completed' }
    ];

    const handleGenerate = () => {
        console.log('Generating report:', formData);
        // In production: API call to generate report
        alert('Report generated! Download started.');
    };

    const toggleDepartment = (dept: string) => {
        setFormData(prev => ({
            ...prev,
            departments: prev.departments.includes(dept)
                ? prev.departments.filter(d => d !== dept)
                : [...prev.departments, dept]
        }));
    };

    const toggleMetric = (metric: string) => {
        setFormData(prev => ({
            ...prev,
            metrics: prev.metrics.includes(metric)
                ? prev.metrics.filter(m => m !== metric)
                : [...prev.metrics, metric]
        }));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Custom Report Builder
                </h1>
                <p className="text-gray-500 text-sm mt-1">Generate detailed HR reports with custom parameters</p>
            </div>

            {/* Report Builder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                {/* Report Type */}
                <div>
                    <label className="block text-sm font-bold mb-3">Report Type *</label>
                    <div className="grid md:grid-cols-3 gap-3">
                        {reportTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setFormData({ ...formData, report_type: type.value })}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${formData.report_type === type.value
                                            ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mb-2 ${formData.report_type === type.value ? 'text-primary' : 'text-gray-400'}`} />
                                    <div className="text-sm font-bold">{type.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Date Range */}
                <div>
                    <label className="block text-sm font-bold mb-3">Date Range *</label>
                    <div className="grid md:grid-cols-3 gap-3">
                        {dateRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setFormData({ ...formData, date_range: range.value })}
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${formData.date_range === range.value
                                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    {formData.date_range === 'custom' && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-xs font-medium mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Departments */}
                <div>
                    <label className="block text-sm font-bold mb-3">Departments (Select All or Specific)</label>
                    <div className="flex flex-wrap gap-2">
                        {departments.map((dept) => (
                            <button
                                key={dept}
                                onClick={() => toggleDepartment(dept)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.departments.includes(dept)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metrics */}
                <div>
                    <label className="block text-sm font-bold mb-3">Metrics to Include</label>
                    <div className="grid md:grid-cols-2 gap-2">
                        {metrics.map((metric) => (
                            <label key={metric.value} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                <input
                                    type="checkbox"
                                    checked={formData.metrics.includes(metric.value)}
                                    onChange={() => toggleMetric(metric.value)}
                                    className="w-4 h-4 rounded text-primary"
                                />
                                <span className="text-sm font-medium">{metric.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Format & Schedule */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Export Format</label>
                        <select
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF Document</option>
                            <option value="csv">CSV File</option>
                            <option value="google_sheets">Google Sheets</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Schedule (Optional)</label>
                        <select
                            value={formData.schedule}
                            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="none">One-time Report</option>
                            <option value="daily">Daily (8:00 AM)</option>
                            <option value="weekly">Weekly (Monday)</option>
                            <option value="monthly">Monthly (1st)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => router.push('/hr/analytics')}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    onClick={handleGenerate}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Generate Report
                </button>
                {formData.schedule !== 'none' && (
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Schedule
                    </button>
                )}
            </div>

            {/* Recent Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Recent Reports</h2>
                <div className="space-y-3">
                    {[
                        { name: 'Employee Performance - December 2024', date: '2024-12-10', size: '2.4 MB', format: 'Excel' },
                        { name: 'Payroll Summary - November 2024', date: '2024-11-30', size: '1.8 MB', format: 'PDF' },
                        { name: 'Leave Analysis - Q4 2024', date: '2024-12-01', size: '980 KB', format: 'CSV' }
                    ].map((report, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                                    <p className="text-xs text-gray-500">{report.date} • {report.size} • {report.format}</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                                <Download className="w-4 h-4 inline mr-1" /> Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
