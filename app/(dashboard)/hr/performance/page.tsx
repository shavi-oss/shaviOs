"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Award,
    TrendingUp,
    Users,
    Star,
    Calendar,
    Eye,
    Edit,
    Download,
    Filter
} from 'lucide-react';

interface PerformanceReview {
    id: string;
    employee_id: string;
    employee_name: string;
    position: string;
    reviewer_name: string;
    period: string;
    overall_rating: number;
    technical_skills: number;
    communication: number;
    teamwork: number;
    leadership: number;
    status: 'pending' | 'completed' | 'scheduled';
    review_date: string;
    feedback?: string;
}

export default function PerformanceReviewsPage() {
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: employees } = await supabase
                .from('employees')
                .select('*')
                .limit(20);

            // Generate mock reviews
            const mockReviews: PerformanceReview[] = (employees || []).map((emp, idx) => {
                const overallRating = 3 + Math.random() * 2;
                const statuses: Array<'pending' | 'completed' | 'scheduled'> = ['pending', 'completed', 'scheduled'];

                return {
                    id: `review-${idx + 1}`,
                    employee_id: emp.id,
                    employee_name: `${emp.first_name} ${emp.last_name}`,
                    position: emp.position || 'موظف',
                    reviewer_name: 'مدير القسم',
                    period: 'Q4 2025',
                    overall_rating: parseFloat(overallRating.toFixed(1)),
                    technical_skills: 3 + Math.random() * 2,
                    communication: 3 + Math.random() * 2,
                    teamwork: 3 + Math.random() * 2,
                    leadership: 3 + Math.random() * 2,
                    status: statuses[idx % 3],
                    review_date: new Date(2025, 11, 15 + idx).toISOString(),
                    feedback: idx % 2 === 0 ? 'أداء ممتاز ومستمر في التحسن' : undefined
                };
            });

            setReviews(mockReviews);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (filterStatus === 'all') return true;
        return review.status === filterStatus;
    });

    const stats = {
        total: reviews.length,
        completed: reviews.filter(r => r.status === 'completed').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length : 0,
        highPerformers: reviews.filter(r => r.overall_rating >= 4.5).length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'scheduled': return 'مجدول';
            default: return 'قيد الانتظار';
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
        if (rating >= 3.5) return 'text-blue-600 dark:text-blue-400';
        if (rating >= 2.5) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التقييمات...</p>
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
                        <Award className="w-8 h-8 text-primary" />
                        تقييمات الأداء
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">متابعة وإدارة تقييمات الموظفين</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير التقرير
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي التقييمات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">مكتملة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">قيد الانتظار</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.avgRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">متوسط التقييم</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPerformers}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">أداء متميز</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">كل الحالات</option>
                    <option value="completed">مكتملة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="scheduled">مجدولة</option>
                </select>
            </div>

            {/* Reviews Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {review.employee_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{review.position}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    المراجع: {review.reviewer_name}
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                                {getStatusLabel(review.status)}
                            </span>
                        </div>

                        {/* Overall Rating */}
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">التقييم الإجمالي</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(review.overall_rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-lg font-bold ${getRatingColor(review.overall_rating)}`}>
                                        {review.overall_rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">المهارات التقنية</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {review.technical_skills.toFixed(1)}/5
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">التواصل</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {review.communication.toFixed(1)}/5
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">العمل الجماعي</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {review.teamwork.toFixed(1)}/5
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">القيادة</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {review.leadership.toFixed(1)}/5
                                </span>
                            </div>
                        </div>

                        {/* Feedback */}
                        {review.feedback && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{review.feedback}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(review.review_date).toLocaleDateString('ar-EG')}
                            </div>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                    <Edit className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
