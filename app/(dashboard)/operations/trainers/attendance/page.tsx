"use client";

import { useState } from 'react';
import {
    CheckSquare,
    Calendar,
    Users,
    AlertTriangle,
    Search,
    Download
} from 'lucide-react';

export default function AttendancePage() {
    const [selectedSession, setSelectedSession] = useState('1');

    const sessions = [
        { id: '1', course: 'Advanced JavaScript', date: '2024-12-11', time: '10:00 AM' },
        { id: '2', course: 'React Fundamentals', date: '2024-12-11', time: '2:00 PM' },
        { id: '3', course: 'Python for Data Science', date: '2024-12-10', time: '9:00 AM' }
    ];

    const students = [
        { id: '1', name: 'Ahmed Hassan', status: 'present', sessions_attended: 10, total_sessions: 12, rate: 83 },
        { id: '2', name: 'Fatima Ali', status: 'present', sessions_attended: 12, total_sessions: 12, rate: 100 },
        { id: '3', name: 'Omar Khalid', status: 'absent', sessions_attended: 8, total_sessions: 12, rate: 67 },
        { id: '4', name: 'Sara Mohamed', status: 'late', sessions_attended: 11, total_sessions: 12, rate: 92 },
        { id: '5', name: 'Youssef Ahmed', status: 'present', sessions_attended: 9, total_sessions: 12, rate: 75 }
    ];

    const [attendance, setAttendance] = useState<Record<string, string>>(
        students.reduce((acc, s) => ({ ...acc, [s.id]: s.status }), {})
    );

    const stats = {
        total: students.length,
        present: Object.values(attendance).filter(s => s === 'present').length,
        absent: Object.values(attendance).filter(s => s === 'absent').length,
        rate: 87
    };

    const atRiskStudents = students.filter(s => s.rate < 70);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-primary" />
                        Attendance Tracking
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Mark and monitor student attendance</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Students</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.present}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Present</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.absent}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">Absent</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.rate}%</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Attendance Rate</div>
                </div>
            </div>

            {/* At-Risk Alerts */}
            {atRiskStudents.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-400">Students at Risk</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {atRiskStudents.length} student(s) with attendance below 70%
                            </p>
                            <div className="flex gap-2 mt-2">
                                {atRiskStudents.map(s => (
                                    <span key={s.id} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                        {s.name} ({s.rate}%)
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="block text-sm font-medium mb-2">Select Session</label>
                <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                    {sessions.map(session => (
                        <option key={session.id} value={session.id}>
                            {session.course} - {new Date(session.date).toLocaleDateString()} at {session.time}
                        </option>
                    ))}
                </select>
            </div>

            {/* Attendance Sheet */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold">Attendance Sheet</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Sessions</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Rate</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                    {student.sessions_attended}/{student.total_sessions}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${student.rate >= 80 ? 'bg-green-100 text-green-700' :
                                            student.rate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {student.rate}%
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex justify-center gap-2">
                                        {['present', 'absent', 'late', 'excused'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setAttendance({ ...attendance, [student.id]: status })}
                                                className={`px-3 py-1 rounded text-xs font-bold capitalize transition-all ${attendance[student.id] === status
                                                        ? status === 'present' ? 'bg-green-600 text-white' :
                                                            status === 'absent' ? 'bg-red-600 text-white' :
                                                                status === 'late' ? 'bg-orange-600 text-white' :
                                                                    'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {status === 'present' ? '✓' :
                                                    status === 'absent' ? '✗' :
                                                        status === 'late' ? '⏰' : '📝'}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
                    <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">
                        Save Attendance
                    </button>
                </div>
            </div>
        </div>
    );
}
