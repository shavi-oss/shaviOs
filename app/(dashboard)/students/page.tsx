'use client';

import { useState, useEffect } from 'react';
import { getStudents } from '@/app/actions/students';
import { 
    Users, 
    Search, 
    Plus, 
    MoreVertical, 
    GraduationCap, 
    AlertCircle, 
    CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadStudents();
    }, [page, search]);

    const loadStudents = async () => {
        setLoading(true);
        const { data, count } = await getStudents(search, 'all', page, 10);
        setStudents(data);
        setTotal(count);
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'at_risk': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary" />
                        Students Management
                    </h1>
                    <p className="text-gray-500">Track profiles, enrollments and performance.</p>
                </div>
                <button 
                    onClick={() => alert('TODO: Add Student Modal (Next Step)')}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" /> Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Student Name</th>
                            <th className="p-4 font-medium text-gray-500">Contact</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Progress</th>
                            <th className="p-4 font-medium text-gray-500">Joined</th>
                            <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students found.</td></tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {student.full_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{student.full_name}</div>
                                                <div className="text-xs text-gray-400">ID: {student.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">
                                        <div className="text-xs">{student.email}</div>
                                        <div className="text-xs opacity-70">{student.phone || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                                            {student.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                            <div 
                                                className="bg-primary h-1.5 rounded-full" 
                                                style={{ width: `${student.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1 block">{student.progress || 0}%</span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(student.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link 
                                            href={`/students/${student.id}`}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full inline-block"
                                        >
                                            <Pagination className="w-4 h-4 text-gray-400" /> 
                                            {/* Note: Pagination icon as placeholder for arrow or more */}
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper icon
function Pagination({ className }: { className?: string }) { return null; }
