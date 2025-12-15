"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Filter,
    Plus,
    BookOpen,
    Users,
    Clock,
    Calendar,
    GraduationCap,
    MoreVertical
} from 'lucide-react';

interface Course {
    id: string;
    title: string;
    code: string;
    category: string;
    level: string;
    duration_weeks: number;
    price: number;
    status: string;
    description?: string | null;
}

interface CourseSession {
    id: string;
    course_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    course?: Course;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<CourseSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'courses' | 'sessions'>('courses');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const supabase = createClient();

            // Fetch Courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (coursesError) {
                console.warn('Courses table might not exist yet:', coursesError.message);
            } else {
                setCourses(coursesData || []);
            }

            // Fetch Sessions with Course details
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('course_sessions')
                .select('*, course:courses(title, code)')
                .order('start_date', { ascending: true });

            if (!sessionsError) {
                setSessions(sessionsData as any || []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusConfig = (status: string) => {
        const configs = {
            active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'نشط' },
            archived: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'مؤرشف' },
            draft: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'مسودة' },
            scheduled: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'مجدول' },
            ongoing: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'جاري' },
            completed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'مكتمل' },
            cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'ملغي' },
        };
        return configs[status as keyof typeof configs] || configs.active;
    };

    const getLevelLabel = (level: string) => {
        const labels = {
            beginner: 'مبتدأ',
            intermediate: 'مستوى متوسط',
            advanced: 'متقدم'
        };
        return labels[level as keyof typeof labels] || level;
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            programming: 'برمجة',
            design: 'تصميم',
            marketing: 'تسويق',
            business: 'إدارة أعمال',
            languages: 'لغات',
            data: 'علوم بيانات'
        };
        return labels[cat] || cat;
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSessions = sessions.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الدورات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">الدورات التدريبية</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة البرامج التدريبية والجلسات
                    </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'courses'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        الدورات ({courses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sessions'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        الجلسات ({sessions.length})
                    </button>
                </div>
                <button
                    onClick={() => router.push(activeTab === 'courses' ? '/trainers/courses/new' : '/trainers/sessions/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {activeTab === 'courses' ? 'دورة جديدة' : 'جلسة جديدة'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder={activeTab === 'courses' ? "بحث باسم الدورة أو الكود..." : "بحث باسم الجلسة..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Content */}
            {activeTab === 'courses' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map(course => {
                        const statusConfig = getStatusConfig(course.status);
                        return (
                            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-mono">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{course.code}</span>
                                    <span>•</span>
                                    <span>{getCategoryLabel(course.category)}</span>
                                </div>

                                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">المستوى:</span>
                                        <span className="font-medium">{getLevelLabel(course.level)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">المدة:</span>
                                        <span className="font-medium">{course.duration_weeks} أسابيع</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">السعر:</span>
                                        <span className="font-bold text-primary">{course.price.toLocaleString('ar-EG')} ج.م</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الجلسة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدورة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{session.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {session.course?.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{new Date(session.start_date).toLocaleDateString('ar-EG')}</span>
                                            <span className="text-xs text-gray-400">إلى {new Date(session.end_date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(session.status).color}`}>
                                            {getStatusConfig(session.status).label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
