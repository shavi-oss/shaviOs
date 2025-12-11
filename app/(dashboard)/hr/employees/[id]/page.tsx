"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    Award,
    TrendingUp,
    FileText,
    DollarSign,
    CheckCircle,
    Upload,
    Edit,
    MoreVertical,
    UserPlus,
    Target,
    Clock,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'payroll' | 'documents' | 'leave'>('overview');

    // Mock employee data
    const employee = {
        id,
        name: 'Ahmed Hassan',
        position: 'Senior Sales Manager',
        department: 'Sales',
        email: 'ahmed.hassan@shavi.com',
        phone: '+20 123 456 789',
        location: 'Cairo, Egypt',
        employment_type: 'mixed',
        status: 'active',
        hire_date: '2022-03-15',
        performance_score: 92,
        leave_balance: 15,
        salary: 25000,
        commission_rate: 10,
        total_deals: 45,
        revenue_generated: 2500000,
        kpis: [
            { name: 'Revenue Target', current: 2500000, target: 3000000, achievement: 83 },
            { name: 'Deals Closed', current: 45, target: 50, achievement: 90 },
            { name: 'Customer Satisfaction', current: 4.8, target: 4.5, achievement: 107 }
        ],
        documents: [
            { name: 'CV_Ahmed_Hassan.pdf', type: 'CV', uploaded: '2022-03-10' },
            { name: 'Contract_2022.pdf', type: 'Contract', uploaded: '2022-03-15' },
            { name: 'ID_Copy.pdf', type: 'ID', uploaded: '2022-03-10' }
        ]
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/hr/employees" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Directory
                </Link>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold">
                        <Edit className="w-4 h-4 inline mr-1" /> Edit Profile
                    </button>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Left Panel - Profile Info (25%) */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Avatar & Basic Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{employee.position}</p>
                        <div className="flex justify-center gap-2 mt-3">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">● Active</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Mixed</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">{employee.email}</a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{employee.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{employee.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{employee.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">Joined {new Date(employee.hire_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Performance</span>
                                <span className="text-lg font-black text-green-600">{employee.performance_score}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Leave Balance</span>
                                <span className="text-lg font-black text-blue-600">{employee.leave_balance} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Deals</span>
                                <span className="text-lg font-black text-purple-600">{employee.total_deals}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Panel - Tabs (50%) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                            <div className="flex gap-4 overflow-x-auto">
                                {['overview', 'performance', 'payroll', 'documents', 'leave'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-black text-blue-600">${(employee.revenue_generated / 1000).toFixed(0)}K</div>
                                            <div className="text-xs text-blue-700 mt-1">Revenue Generated</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200">
                                            <div className="text-2xl font-black text-green-600">{employee.total_deals}</div>
                                            <div className="text-xs text-green-700 mt-1">Deals Closed</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                                        <div className="space-y-3">
                                            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Closed deal with Tech Corp</p>
                                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Submitted monthly report</p>
                                                    <p className="text-xs text-gray-500">1 day ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Performance Tab */}
                            {activeTab === 'performance' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">KPI Overview</h3>
                                        <div className="space-y-4">
                                            {employee.kpis.map((kpi, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{kpi.name}</span>
                                                        <span className="text-sm font-black text-primary">{kpi.achievement}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-full rounded-full ${kpi.achievement >= 100 ? 'bg-green-500' : kpi.achievement >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                                            style={{ width: `${Math.min(kpi.achievement, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>Current: {typeof kpi.current === 'number' && kpi.current > 1000 ? `$${(kpi.current / 1000).toFixed(0)}K` : kpi.current}</span>
                                                        <span>Target: {typeof kpi.target === 'number' && kpi.target > 1000 ? `$${(kpi.target / 1000).toFixed(0)}K` : kpi.target}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payroll Tab */}
                            {activeTab === 'payroll' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                                            <div className="text-xs text-green-700 dark:text-green-400 mb-1">Base Salary</div>
                                            <div className="text-2xl font-black text-green-600">${employee.salary.toLocaleString()}</div>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                                            <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Commission Rate</div>
                                            <div className="text-2xl font-black text-blue-600">{employee.commission_rate}%</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Payslip: December 2024</p>
                                        <button className="mt-2 text-sm font-bold text-primary hover:underline">Download Payslip →</button>
                                    </div>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className="space-y-3">
                                    {employee.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.type} • Uploaded {doc.uploaded}</p>
                                                </div>
                                            </div>
                                            <button className="text-primary font-bold text-sm hover:underline">View</button>
                                        </div>
                                    ))}
                                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                        <Upload className="w-4 h-4" /> Upload Document
                                    </button>
                                </div>
                            )}

                            {/* Leave Tab */}
                            {activeTab === 'leave' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                                        <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Remaining Leave Balance</div>
                                        <div className="text-3xl font-black text-blue-600">{employee.leave_balance} days</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">No pending leave requests</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Smart Actions (25%) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Smart Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Approve Leave
                            </button>
                            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
                                <DollarSign className="w-4 h-4" /> Convert to Salary+Commission
                            </button>
                            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Target className="w-4 h-4" /> Assign KPIs
                            </button>
                            <button className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700 flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" /> Upload Document
                            </button>
                            <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 flex items-center justify-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Promote Employee
                            </button>
                            <button className="w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2">
                                <Briefcase className="w-4 h-4" /> Change Department
                            </button>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Recent Notifications</h3>
                        <div className="space-y-3 text-xs">
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="font-bold text-green-700">KPI Achievement</p>
                                <p className="text-green-600">Exceeded revenue target this month</p>
                            </div>
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="font-bold text-blue-700">Performance Review Due</p>
                                <p className="text-blue-600">Quarterly review scheduled for Dec 20</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
