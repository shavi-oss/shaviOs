"use client";

import { useEffect, useState } from 'react';
import {
    Users,
    Briefcase,
    Calendar,
    Eye,
    UserPlus,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Download
} from 'lucide-react';

interface JobPosting {
    id: string;
    title: string;
    department: string;
    type: 'full-time' | 'part-time' | 'contract';
    location: string;
    applicants: number;
    status: 'open' | 'closed' | 'on-hold';
    posted_date: string;
}

interface Candidate {
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
    applied_date: string;
    experience: number;
}

export default function RecruitmentPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Generate mock jobs
            const mockJobs: JobPosting[] = Array.from({ length: 8 }, (_, idx) => ({
                id: `job-${idx + 1}`,
                title: [
                    'مطور Full Stack',
                    'مدير مبيعات',
                    'مصمم UI/UX',
                    'محاسب',
                    'مسوق رقمي',
                    'مطور Mobile',
                    'محلل بيانات',
                    'مدير موارد بشرية'
                ][idx],
                department: ['تقنية', 'مبيعات', 'تصميم', 'مالية', 'تسويق', 'تقنية', 'تقنية', 'موارد بشرية'][idx],
                type: ['full-time', 'full-time', 'contract', 'full-time', 'part-time', 'full-time', 'full-time', 'full-time'][idx] as any,
                location: 'القاهرة',
                applicants: 10 + (idx * 5),
                status: ['open', 'open', 'on-hold', 'open', 'closed', 'open', 'open', 'open'][idx] as any,
                posted_date: new Date(Date.now() - idx * 86400000 * 3).toISOString()
            }));

            // Generate mock candidates
            const mockCandidates: Candidate[] = Array.from({ length: 15 }, (_, idx) => ({
                id: `candidate-${idx + 1}`,
                name: `مرشح ${idx + 1}`,
                position: mockJobs[idx % mockJobs.length].title,
                email: `candidate${idx + 1}@example.com`,
                phone: `+20 ${1000000000 + idx}`,
                status: ['applied', 'screening', 'interview', 'offer', 'rejected'][idx % 5] as any,
                applied_date: new Date(Date.now() - idx * 86400000).toISOString(),
                experience: 1 + (idx % 7)
            }));

            setJobs(mockJobs);
            setCandidates(mockCandidates);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setJobs([]);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        openJobs: jobs.filter(j => j.status === 'open').length,
        totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
        inInterview: candidates.filter(c => c.status === 'interview').length,
        offers: candidates.filter(c => c.status === 'offer').length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
            case 'on-hold': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'offer': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'interview': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'screening': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            open: 'مفتوحة',
            closed: 'مغلقة',
            'on-hold': 'معلقة',
            applied: 'تقدم',
            screening: 'فحص',
            interview: 'مقابلة',
            offer: 'عرض',
            rejected: 'مرفوض'
        };
        return labels[status as keyof typeof labels] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
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
                        <UserPlus className="w-8 h-8 text-primary" />
                        التوظيف
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">إدارة الوظائف والمرشحين</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    وظيفة جديدة
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Briefcase className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openJobs}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">وظائف مفتوحة</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplicants}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي المتقدمين</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inInterview}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">في المقابلات</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.offers}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">عروض مقدمة</div>
                </div>
            </div>

            {/* Job Postings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">الوظائف المتاحة</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{job.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.department}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                    {getStatusLabel(job.status)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>{job.applicants} متقدم</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    عرض المتقدمين
                                </button>
                                <button className="px-3 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                                    <Eye className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Candidates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">المرشحون</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المرشح</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الوظيفة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الخبرة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ التقديم</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {candidates.slice(0, 10).map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {candidate.position}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {candidate.experience} سنوات
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(candidate.applied_date).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                                            {getStatusLabel(candidate.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
