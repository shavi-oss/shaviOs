"use client";

import { useState } from 'react';
import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    DollarSign,
    Award,
    Upload,
    CheckSquare,
    Clock,
    BarChart3,
    Bell,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function TrainerDashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // KPI Data
    const kpis = {
        total_students: 28,
        upcoming_sessions: 5,
        pending_assignments: 12,
        attendance_rate: 87,
        total_earnings: 45000,
        performance_score: 92
    };

    // Upcoming Sessions
    const upcomingSessions = [
        { id: '1', course: 'Advanced JavaScript', date: '2024-12-11', time: '10:00 AM', students: 12, location: 'Room 101' },
        { id: '2', course: 'React Fundamentals', date: '2024-12-11', time: '2:00 PM', students: 15, location: 'Virtual' },
        { id: '3', course: 'Python for Data Science', date: '2024-12-12', time: '9:00 AM', students: 10, location: 'Lab 202' },
        { id: '4', course: 'Advanced JavaScript', date: '2024-12-13', time: '10:00 AM', students: 12, location: 'Room 101' },
        { id: '5', course: 'Web Development Bootcamp', date: '2024-12-14', time: '3:00 PM', students: 18, location: 'Virtual' }
    ];

    // Recent Submissions
    const recentSubmissions = [
        { id: '1', student: 'Ahmed Hassan', assignment: 'JavaScript Arrays & Objects', submitted: '2 hours ago', status: 'pending' },
        { id: '2', student: 'Fatima Ali', assignment: 'React Hooks Exercise', submitted: '5 hours ago', status: 'pending' },
        { id: '3', student: 'Omar Khalid', assignment: 'Python Data Analysis Project', submitted: '1 day ago', status: 'graded' }
    ];

    // Sessions per week data
    const sessionsData = [
        { week: 'Week 1', count: 8 },
        { week: 'Week 2', count: 10 },
        { week: 'Week 3', count: 9 },
        { week: 'Week 4', count: 12 }
    ];
    const maxSessions = Math.max(...sessionsData.map(d => d.count));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Trainer Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your training overview</p>
                </div>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Total Students */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Users className="w-5 h-5 text-blue-600 mb-2" />
                    <div className="text-2xl font-black text-blue-600">{kpis.total_students}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Students</div>
                </div>

                {/* Upcoming Sessions */}
                <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-2xl font-black text-purple-600">{kpis.upcoming_sessions}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Upcoming Sessions</div>
                </div>

                {/* Pending Assignments */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <FileText className="w-5 h-5 text-orange-600 mb-2" />
                    <div className="text-2xl font-black text-orange-600">{kpis.pending_assignments}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">To Grade</div>
                </div>

                {/* Attendance Rate */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <CheckSquare className="w-5 h-5 text-green-600 mb-2" />
                    <div className="text-2xl font-black text-green-600">{kpis.attendance_rate}%</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Attendance Rate</div>
                </div>

                {/* Total Earnings */}
                <div className="bg-linear-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800">
                    <DollarSign className="w-5 h-5 text-teal-600 mb-2" />
                    <div className="text-2xl font-black text-teal-600">${(kpis.total_earnings / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-teal-700 dark:text-teal-400 font-medium mt-1">This Month</div>
                </div>

                {/* Performance Score */}
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <Award className="w-5 h-5 text-yellow-600 mb-2" />
                    <div className="text-2xl font-black text-yellow-600">{kpis.performance_score}</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mt-1">Performance</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-3">
                    <Link href="/operations/trainers/files/upload" className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-all">
                        <Upload className="w-5 h-5 text-blue-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">Upload Material</div>
                        <div className="text-xs text-gray-500 mt-1">Upload training files</div>
                    </Link>

                    <Link href="/operations/trainers/assignments/new" className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-all">
                        <FileText className="w-5 h-5 text-purple-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">Create Assignment</div>
                        <div className="text-xs text-gray-500 mt-1">Add new task for students</div>
                    </Link>

                    <Link href="/operations/trainers/attendance" className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-all">
                        <CheckSquare className="w-5 h-5 text-green-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">Mark Attendance</div>
                        <div className="text-xs text-gray-500 mt-1">Track student attendance</div>
                    </Link>

                    <Link href="/operations/trainers/reports/new" className="p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800 transition-all">
                        <BarChart3 className="w-5 h-5 text-orange-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">Daily Report</div>
                        <div className="text-xs text-gray-500 mt-1">Create session report</div>
                    </Link>

                    <Link href="/operations/trainers/schedule" className="p-4 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800 transition-all">
                        <Calendar className="w-5 h-5 text-teal-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">View Schedule</div>
                        <div className="text-xs text-gray-500 mt-1">See your calendar</div>
                    </Link>

                    <Link href="/operations/trainers/messages" className="p-4 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800 transition-all">
                        <MessageSquare className="w-5 h-5 text-pink-600 mb-2" />
                        <div className="font-bold text-gray-900 dark:text-white">Messages</div>
                        <div className="text-xs text-gray-500 mt-1">Contact admin</div>
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Upcoming Sessions</h2>
                        <Link href="/operations/trainers/sessions" className="text-sm text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {upcomingSessions.map(session => (
                            <Link
                                key={session.id}
                                href={`/operations/trainers/sessions/${session.id}`}
                                className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-gray-900 dark:text-white">{session.course}</div>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                        {session.students} students
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(session.date).toISOString().split('T')[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {session.time}
                                    </span>
                                    <span>{session.location}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Recent Submissions</h2>
                        <Link href="/operations/trainers/assignments" className="text-sm text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentSubmissions.map(sub => (
                            <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{sub.student}</div>
                                        <div className="text-xs text-gray-600">{sub.assignment}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${sub.status === 'pending'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">{sub.submitted}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sessions Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Sessions This Month</h2>
                <div className="flex items-end justify-between gap-2 h-48">
                    {sessionsData.map((data, idx) => {
                        const height = (data.count / maxSessions) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{data.count}</div>
                                <div
                                    className="w-full bg-linear-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 font-medium">{data.week}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    Recent Notifications
                </h2>
                <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">New session assigned</div>
                        <div className="text-xs text-gray-600 mt-1">Web Development Bootcamp - Dec 14, 3:00 PM</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Commission approved</div>
                        <div className="text-xs text-gray-600 mt-1">$5,000 for November sessions has been approved</div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Assignment deadline approaching</div>
                        <div className="text-xs text-gray-600 mt-1">React Hooks Exercise due in 2 days - 8 pending submissions</div>
                    </div>
                </div>
            </div>
        </div >
    );
}
