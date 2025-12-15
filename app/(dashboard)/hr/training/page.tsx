"use client";

import { useEffect, useState } from 'react';
import {
    GraduationCap,
    Users,
    Calendar,
    Award,
    TrendingUp,
    Eye,
    Plus,
    Download,
    CheckCircle
} from 'lucide-react';

interface TrainingCourse {
    id: string;
    title: string;
    instructor: string;
    category: string;
    duration: number;
    enrolled: number;
    completed: number;
    status: 'active' | 'upcoming' | 'completed';
    start_date: string;
    progress: number;
}

export default function TrainingManagementPage() {
    const [courses, setCourses] = useState<TrainingCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);

            // Generate mock courses
            const mockCourses: TrainingCourse[] = Array.from({ length: 12 }, (_, idx) => {
                const enrolled = 15 + (idx * 3);
                const completed = Math.floor(enrolled * (0.6 + Math.random() * 0.3));
                const progress = (completed / enrolled) * 100;

                return {
                    id: `course-${idx + 1}`,
                    title: [
                        'أساسيات البرمجة',
                        'إدارة المشاريع',
                        'التسويق الرقمي',
                        'تحليل البيانات',
                        'القيادة الفعالة',
                        'خدمة العملاء',
                        'المحاسبة المالية',
                        'التصميم الجرافيكي',
                        'إدارة الوقت',
                        'مهارات التواصل',
                        'الأمن السيبراني',
                        'التفكير الإبداعي'
                    ][idx],
                    instructor: `مدرب ${idx + 1}`,
                    category: ['تقنية', 'إدارة', 'تسويق', 'تقنية', 'قيادة', 'خدمات', 'مالية', 'تصميم', 'مهارات', 'مهارات', 'تقنية', 'مهارات'][idx],
                    duration: 10 + (idx * 2),
                    enrolled,
                    completed,
                    status: ['active', 'upcoming', 'completed'][idx % 3] as any,
                    start_date: new Date(2025, 0, 1 + idx * 3).toISOString(),
                    progress
                };
            });

            setCourses(mockCourses);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.status === 'active').length,
        totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
        totalCompleted: courses.reduce((sum, c) => sum + c.completed, 0),
        avgCompletion: courses.length > 0 ? courses.reduce((sum, c) => sum + c.progress, 0) / courses.length : 0
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'upcoming': return 'قادم';
            case 'completed': return 'مكتمل';
            default: return status;
        }
    };

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary" />
                        إدارة التدريب
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة الدورات التدريبية والشهادات</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    دورة جديدة
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <GraduationCap className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي الدورات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCourses}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">دورات نشطة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEnrolled}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متدربين</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompleted}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مكتملة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgCompletion.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">معدل الإكمال</div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{course.instructor}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                                {getStatusLabel(course.status)}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">التصنيف</span>
                                <span className="font-medium text-gray-900 dark:text-white">{course.category}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">المدة</span>
                                <span className="font-medium text-gray-900 dark:text-white">{course.duration} ساعة</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">المتدربين</span>
                                <span className="font-medium text-gray-900 dark:text-white">{course.enrolled}</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>التقدم</span>
                                <span>{course.progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${course.progress}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {course.completed} من {course.enrolled} أكملوا
                            </div>
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(course.start_date).toLocaleDateString('ar-EG')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" />
                                عرض
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                                <Award className="w-3 h-3" />
                                شهادات
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
