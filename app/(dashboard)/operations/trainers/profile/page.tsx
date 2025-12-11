"use client";

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Award,
    Calendar,
    TrendingUp,
    Upload,
    Download,
    Edit,
    Star
} from 'lucide-react';

export default function TrainerProfilePage() {
    const [activeTab, setActiveTab] = useState('overview');

    const profile = {
        name: 'Ahmed Mohamed',
        email: 'ahmed.mohamed@shavi.com',
        phone: '+20 1234567890',
        photo: null,
        bio: 'Experienced software development trainer with 8+ years in teaching web technologies',
        specializations: ['JavaScript', 'React', 'Python', 'Web Development'],
        experience_level: 'Senior',
        languages: ['Arabic', 'English'],
        start_date: '2020-01-15',
        total_hours: 1250,
        total_students: 450,
        overall_rating: 4.8,
        performance_score: 92
    };

    const certifications = [
        { name: 'React Advanced Patterns', issuer: 'Meta', date: '2023-05-10', file_url: '#' },
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022-11-20', file_url: '#' },
        { name: 'Professional Scrum Master', issuer: 'Scrum.org', date: '2021-08-15', file_url: '#' }
    ];

    const courses = [
        { name: 'Advanced JavaScript', students: 120, completion_rate: 85 },
        { name: 'React Fundamentals', students: 150, completion_rate: 90 },
        { name: 'Python for Data Science', students: 80, completion_rate: 78 },
        { name: 'Web Development Bootcamp', students: 100, completion_rate: 88 }
    ];

    const kpis = [
        { label: 'Revenue Generated', value: '$250K', color: 'text-green-600' },
        { label: 'Sessions This Month', value: '18', color: 'text-blue-600' },
        { label: 'Avg Class Size', value: '14', color: 'text-purple-600' },
        { label: 'Repeat Students', value: '65%', color: 'text-orange-600' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Trainer Profile</h1>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Profile
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                        <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>

                        <div className="grid md:grid-cols-2 gap-3 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {profile.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Award className="w-4 h-4" />
                                {profile.experience_level} Trainer
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                Since {new Date(profile.start_date).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="flex gap-2 mt-3">
                            {profile.specializations.map((spec, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="text-center">
                        <div className="text-4xl font-black text-yellow-500">{profile.overall_rating}</div>
                        <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`w-4 h-4 ${star <= Math.floor(profile.overall_rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Overall Rating</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{profile.total_students}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Students Trained</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">{profile.total_hours}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Hours Taught</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{courses.length}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Courses Offered</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{profile.performance_score}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Performance Score</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-4 px-6">
                        {['overview', 'certifications', 'courses', 'kpis'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 px-4 font-medium text-sm border-b-2 transition-all capitalize ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Languages</h3>
                                <div className="flex gap-2">
                                    {profile.languages.map((lang, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded text-sm">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Teaching Experience</h3>
                                <p className="text-gray-600 text-sm">
                                    {Math.floor((new Date().getTime() - new Date(profile.start_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years of professional training experience
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Certifications Tab */}
                    {activeTab === 'certifications' && (
                        <div className="space-y-3">
                            {certifications.map((cert, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{cert.name}</div>
                                        <div className="text-sm text-gray-600">{cert.issuer} • {new Date(cert.date).toLocaleDateString()}</div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                        <Download className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            ))}
                            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" /> Upload New Certificate
                            </button>
                        </div>
                    )}

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div className="space-y-3">
                            {courses.map((course, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-gray-900 dark:text-white">{course.name}</div>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                            {course.students} students
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-full rounded-full"
                                                style={{ width: `${course.completion_rate}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">{course.completion_rate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* KPIs Tab */}
                    {activeTab === 'kpis' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {kpis.map((kpi, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
                                    <div className="text-sm text-gray-600 mt-1">{kpi.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
