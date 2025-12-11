"use client";

import { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Grid3x3,
    List,
    Plus,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    TrendingUp,
    Building2,
    FileText,
    Download
} from 'lucide-react';
import Link from 'next/link';

interface Employee {
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    employment_type: 'full_time' | 'commission' | 'mixed';
    status: 'active' | 'on_leave' | 'inactive';
    avatar?: string;
    hire_date: string;
    performance_score: number;
}

export default function EmployeeDirectoryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employmentFilter, setEmploymentFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Mock data
    const employees: Employee[] = [
        {
            id: '1',
            name: 'Ahmed Hassan',
            position: 'Senior Sales Manager',
            department: 'Sales',
            email: 'ahmed.hassan@shavi.com',
            phone: '+20 123 456 789',
            employment_type: 'mixed',
            status: 'active',
            hire_date: '2022-03-15',
            performance_score: 92
        },
        {
            id: '2',
            name: 'Sarah Mohamed',
            position: 'HR Manager',
            department: 'HR',
            email: 'sarah.mohamed@shavi.com',
            phone: '+20 111 222 333',
            employment_type: 'full_time',
            status: 'active',
            hire_date: '2021-01-10',
            performance_score: 95
        },
        {
            id: '3',
            name: 'Omar Khalid',
            position: 'Marketing Specialist',
            department: 'Marketing',
            email: 'omar.khalid@shavi.com',
            phone: '+20 100 999 888',
            employment_type: 'commission',
            status: 'active',
            hire_date: '2023-06-20',
            performance_score: 88
        },
        {
            id: '4',
            name: 'Fatima Ali',
            position: 'Customer Support Lead',
            department: 'Customer Success',
            email: 'fatima.ali@shavi.com',
            phone: '+20 122 333 444',
            employment_type: 'full_time',
            status: 'on_leave',
            hire_date: '2022-09-05',
            performance_score: 90
        },
        {
            id: '5',
            name: 'Mohamed Saeed',
            position: 'Finance Director',
            department: 'Finance',
            email: 'mohamed.saeed@shavi.com',
            phone: '+20 127 888 999',
            employment_type: 'full_time',
            status: 'active',
            hire_date: '2020-11-12',
            performance_score: 96
        },
        {
            id: '6',
            name: 'Laila Ibrahim',
            position: 'Operations Coordinator',
            department: 'Operations',
            email: 'laila.ibrahim@shavi.com',
            phone: '+20 110 555 666',
            employment_type: 'full_time',
            status: 'active',
            hire_date: '2023-02-28',
            performance_score: 85
        }
    ];

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
        const matchesEmployment = employmentFilter === 'all' || emp.employment_type === employmentFilter;

        return matchesSearch && matchesDepartment && matchesStatus && matchesEmployment;
    });

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        on_leave: employees.filter(e => e.status === 'on_leave').length,
        pending_requests: 3
    };

    const getEmploymentBadge = (type: string) => {
        if (type === 'full_time') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Full-time</span>;
        if (type === 'commission') return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Commission</span>;
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Mixed</span>;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">●</span>;
        if (status === 'on_leave') return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">🏖️ On Leave</span>;
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Inactive</span>;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Employee Directory
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all employees across departments</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link href="/hr/employees/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Employee
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Employees</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.active}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Active</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.on_leave}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">On Leave</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.pending_requests}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Pending Requests</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search employees..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="all">All Departments</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Operations">Operations</option>
                            <option value="Customer Success">Customer Success</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <Grid3x3 className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <List className="w-4 h-4 mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Employee Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEmployees.map(employee => (
                        <Link
                            key={employee.id}
                            href={`/hr/employees/${employee.id}`}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                        {employee.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">{employee.position}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(employee.status)}
                                        {getEmploymentBadge(employee.employment_type)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-3 h-3" />
                                    <span>{employee.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    <span>Performance: {employee.performance_score}%</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Joined {new Date(employee.hire_date).toLocaleDateString()}</span>
                                    <span className="text-primary font-bold group-hover:underline">View Profile →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Performance</th>
                                <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => (
                                <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{employee.name}</div>
                                                <div className="text-xs text-gray-500">{employee.position}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{employee.department}</td>
                                    <td className="py-3 px-4">{getStatusBadge(employee.status)}</td>
                                    <td className="py-3 px-4">{getEmploymentBadge(employee.employment_type)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-lg font-black text-green-600">{employee.performance_score}%</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={`/hr/employees/${employee.id}`}
                                            className="text-primary font-bold text-sm hover:underline"
                                        >
                                            View Profile →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredEmployees.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No employees match your filters</p>
                </div>
            )}
        </div>
    );
}
