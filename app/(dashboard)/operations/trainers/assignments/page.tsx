"use client";

import { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Upload
} from 'lucide-react';
import Link from 'next/link';

export default function AssignmentsPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const assignments = [
        { id: '1', title: 'JavaScript Arrays & Objects', course: 'Advanced JavaScript', due_date: '2024-12-15', submissions: 8, total: 12, status: 'open' },
        { id: '2', title: 'React Hooks Exercise', course: 'React Fundamentals', due_date: '2024-12-18', submissions: 12, total: 15, status: 'open' },
        { id: '3', title: 'Python Data Analysis Project', course: 'Python for Data Science', due_date: '2024-12-12', submissions: 10, total: 10, status: 'closed' },
        { id: '4', title: 'Build a Landing Page', course: 'Web Development Bootcamp', due_date: '2024-12-20', submissions: 5, total: 18, status: 'open' }
    ];

    const pendingGrading = [
        { id: '1', student: 'Ahmed Hassan', assignment: 'JavaScript Arrays & Objects', submitted: '2 hours ago' },
        { id: '2', student: 'Fatima Ali', assignment: 'React Hooks Exercise', submitted: '5 hours ago' },
        { id: '3', student: 'Omar Khalid', assignment: 'JavaScript Arrays & Objects', submitted: '1 day ago' }
    ];

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: assignments.length,
        total_submissions: assignments.reduce((sum, a) => sum + a.submissions, 0),
        pending: pendingGrading.length,
        graded_this_week: 15
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Assignments
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage student assignments and grading</p>
                </div>
                <Link href="/operations/trainers/assignments/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Assignment
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Assignments</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.total_submissions}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Submissions</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.pending}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Pending Grading</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.graded_this_week}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Graded This Week</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search assignments..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'open', 'closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold capitalize ${filterStatus === status
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Assignments List */}
                <div className="md:col-span-2 space-y-3">
                    <h2 className="text-lg font-bold">All Assignments</h2>
                    {filteredAssignments.map(assignment => (
                        <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${assignment.status === 'open'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {assignment.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium">{assignment.submissions}/{assignment.total} submitted</span>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <Link
                                    href={`/operations/trainers/assignments/${assignment.id}/grade`}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                                >
                                    Grade ({assignment.submissions})
                                </Link>
                                <Link
                                    href={`/operations/trainers/assignments/${assignment.id}/edit`}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold hover:bg-gray-200"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Grading */}
                <div>
                    <h2 className="text-lg font-bold mb-3">Pending Grading</h2>
                    <div className="space-y-2">
                        {pendingGrading.map(item => (
                            <div key={item.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <div className="font-bold text-gray-900 dark:text-white text-sm">{item.student}</div>
                                <div className="text-xs text-gray-600 mt-1">{item.assignment}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.submitted}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
