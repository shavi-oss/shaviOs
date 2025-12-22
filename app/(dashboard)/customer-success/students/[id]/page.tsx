"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentById, updateStudent } from '@/app/actions/students';
import {
    ArrowLeft,
    Edit2,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    GraduationCap,
    AlertTriangle,
    Ticket,
    MoreVertical,
    X,
    Save
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

// Types
interface StudentProfile {
    profile: {
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
        status: 'active' | 'at_risk' | 'completed' | 'paused' | 'dropped';
        created_at: string;
        // extended fields can be added here
    };
    enrollments: Array<{
        id: string;
        created_at: string;
        status: string;
        course_sessions: {
            name: string;
            courses: {
                title: string;
                code: string;
            };
        };
    }>;
    tickets: Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        created_at: string;
    }>;
}

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [data, setData] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'support'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        status: ''
    });

    useEffect(() => {
        if (id) fetchStudentData();
    }, [id]);

    async function fetchStudentData() {
        try {
            const result = await getStudentById(id);
            if (result) {
                setData(result as any);
                setEditForm({
                    full_name: result.profile.full_name,
                    email: result.profile.email || '',
                    phone: result.profile.phone || '',
                    status: result.profile.status
                });
            }
        } catch (error) {
            console.error('Failed to load student:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('full_name', editForm.full_name);
            formData.append('email', editForm.email);
            formData.append('phone', editForm.phone);
            formData.append('status', editForm.status);

            const result = await updateStudent(id, formData);
            if (result.success) {
                setIsEditing(false);
                fetchStudentData(); // Refresh
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.message || 'Failed to update profile', {
                    description: result.errors ? Object.values(result.errors).flat().join(', ') : undefined
                });
                console.error(result.errors);
            }
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('An unexpected error occurred');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-bold">Student Not Found</h2>
                <button
                    onClick={() => router.push('/customer-success/students')}
                    className="mt-4 text-primary hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'at_risk': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 pb-12">
            {/* Header / Hero */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <button
                        onClick={() => router.push('/customer-success/students')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Students
                    </button>

                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-primary/20">
                                {data.profile.full_name[0]}
                            </div>
                            
                            <div>
                                {isEditing ? (
                                    <div className="space-y-3 min-w-[300px]">
                                        <input
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                            className="w-full text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-b-2 border-primary focus:outline-none px-2 py-1 rounded-t"
                                            placeholder="Full Name"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                                                placeholder="Email"
                                            />
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                                            >
                                                <option value="active">Active</option>
                                                <option value="at_risk">At Risk</option>
                                                <option value="completed">Completed</option>
                                                <option value="paused">Paused</option>
                                                <option value="dropped">Dropped</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                            {data.profile.full_name}
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(data.profile.status)}`}>
                                                {data.profile.status.replace('_', ' ')}
                                            </span>
                                        </h1>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            {data.profile.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {data.profile.email}
                                                </div>
                                            )}
                                            {data.profile.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {data.profile.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                Joined {format(new Date(data.profile.created_at), 'MMMM yyyy')}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/25"
                                    >
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit Profile
                                    </button>
                                    <button
                                        onClick={() => router.push(`/customer-success/tickets/new?student_id=${id}`)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/25 transition-colors"
                                    >
                                        <Ticket className="w-4 h-4" /> Create Ticket
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-12 border-b border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <UserCardIcon className="w-4 h-4" /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('academics')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'academics' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <GraduationCap className="w-4 h-4" /> Academics
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{data.enrollments.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'support' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Ticket className="w-4 h-4" /> Support Tickets
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{data.tickets.length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Key Stats */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Active Courses</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.enrollments.length}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Pending Tickets</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.tickets.filter(t => t.status !== 'resolved').length}
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
                                </div>
                            </div>

                            {/* Recent Activity Mock */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                                <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Updated</p>
                                        <p className="text-xs text-gray-500">Just now</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Enrollment Created</p>
                                        <p className="text-xs text-gray-500">{format(new Date(data.profile.created_at), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Account Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Student ID</p>
                                        <p className="font-mono text-sm">{data.profile.id.substring(0, 8)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getStatusColor(data.profile.status)}`}>
                                            {data.profile.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Language</p>
                                        <p className="text-sm">English</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'academics' && (
                    <div className="space-y-4">
                        {data.enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{enrollment.course_sessions?.courses?.title || 'Unknown Course'}</h4>
                                        <p className="text-sm text-gray-500">{enrollment.course_sessions?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-1">
                                        {enrollment.status}
                                    </span>
                                    <p className="text-xs text-gray-400">Enrolled: {format(new Date(enrollment.created_at), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                        ))}
                        {data.enrollments.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No active enrollments found.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="space-y-4">
                        <div className="flex justify-end mb-4">
                             <button
                                onClick={() => router.push(`/customer-success/tickets/new?student_id=${id}`)}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/25"
                            >
                                <Ticket className="w-4 h-4" /> New Ticket
                            </button>
                        </div>
                        {data.tickets.map((ticket) => (
                            <div 
                                key={ticket.id} 
                                onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)}
                                className="cursor-pointer bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500' : ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{ticket.title}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            #{ticket.id} • {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {ticket.status}
                                    </span>
                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        ))}
                        {data.tickets.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No support tickets history.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon helper
function UserCardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
    )
}
