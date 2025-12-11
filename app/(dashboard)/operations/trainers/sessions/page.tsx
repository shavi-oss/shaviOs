"use client";

import { useState } from 'react';
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Video,
    Filter,
    Search,
    LayoutGrid,
    List,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SessionsPage() {
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const sessions = [
        { id: '1', course: 'Advanced JavaScript', date: '2024-12-11', time: '10:00 AM - 12:00 PM', students: 12, enrolled: 15, location: 'Room 101', type: 'physical', status: 'upcoming' },
        { id: '2', course: 'React Fundamentals', date: '2024-12-11', time: '2:00 PM - 4:00 PM', students: 15, enrolled: 15, location: 'Virtual', type: 'virtual', status: 'upcoming' },
        { id: '3', course: 'Python for Data Science', date: '2024-12-12', time: '9:00 AM - 11:00 AM', students: 10, enrolled: 12, location: 'Lab 202', type: 'physical', status: 'upcoming' },
        { id: '4', course: 'Web Development Bootcamp', date: '2024-12-10', time: '3:00 PM - 5:00 PM', students: 18, enrolled: 18, location: 'Virtual', type: 'virtual', status: 'completed' },
        { id: '5', course: 'Advanced JavaScript', date: '2024-12-09', time: '10:00 AM - 12:00 PM', students: 11, enrolled: 15, location: 'Room 101', type: 'physical', status: 'completed' },
        { id: '6', course: 'Database Design', date: '2024-12-08', time: '1:00 PM - 3:00 PM', students: 0, enrolled: 10, location: 'Virtual', type: 'virtual', status: 'cancelled' }
    ];

    const filteredSessions = sessions.filter(s => {
        const matchesSearch = s.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: sessions.length,
        upcoming: sessions.filter(s => s.status === 'upcoming').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        cancelled: sessions.filter(s => s.status === 'cancelled').length
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
        };
        const badge = badges[status as keyof typeof badges];
        return (
            <span className={`px-2 py-0.5 ${badge.bg} ${badge.text} rounded-full text-xs font-bold`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        Training Sessions
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your training schedule</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-lg ${view === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`p-2 rounded-lg ${view === 'calendar' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Sessions</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.upcoming}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Upcoming</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.completed}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Completed</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.cancelled}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">Cancelled</div>
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
                            placeholder="Search sessions..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
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

            {/* Sessions List */}
            {view === 'list' && (
                <div className="space-y-3">
                    {filteredSessions.map(session => (
                        <Link
                            key={session.id}
                            href={`/operations/trainers/sessions/${session.id}`}
                            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{session.course}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(session.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {session.time}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(session.status)}
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{session.students}/{session.enrolled} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.type === 'virtual' ? (
                                        <>
                                            <Video className="w-4 h-4 text-blue-500" />
                                            <span className="text-blue-600">Virtual</span>
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-4 h-4 text-green-500" />
                                            <span className="text-green-600">{session.location}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Calendar View */}
            {view === 'calendar' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center text-gray-500 py-12">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Calendar view coming soon</p>
                    </div>
                </div>
            )}
        </div>
    );
}
