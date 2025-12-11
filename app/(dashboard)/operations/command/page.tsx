"use client";

import { useRouter } from 'next/navigation';
import {
    Activity,
    AlertOctagon,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    Map as MapIcon,
    Zap,
    TrendingUp,
    ShieldAlert,
    CheckSquare,
    BrainCircuit,
    UserCheck,
    AlertTriangle,
    ThumbsDown,
    BookOpen
} from 'lucide-react';

// Mock Data simulating real-time feed
const LIVE_STATS = {
    active_sessions: 12,
    online_students: 342,
    incidents_today: 1,
    avg_quality: 4.8,
};

const INCIDENTS = [
    { id: 1, title: 'Zoom Connection Lag - Lab A', time: '10:42 AM', severity: 'medium', status: 'investigating' }
];

const UPCOMING_SESSIONS = [
    { id: 101, title: 'React Advanced', time: '11:00 AM', trainer: 'Omar Hassan', room: 'Lab B', status: 'pending' },
    { id: 102, title: 'UX Principles', time: '11:30 AM', trainer: 'Sarah Ahmed', room: 'Lab A', status: 'pending' },
];

export default function CommandPage() {
    const router = useRouter();

    const quickStats = [
        {
            title: "Live Sessions",
            value: "12",
            subtext: "Omar H. (Lab A)", // Trainer liable for live session
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            href: "/operations/schedule"
        },
        {
            title: "Attendance Rate",
            value: "94%",
            subtext: "+2% vs Last Week",
            icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
            href: "/operations/quality"
        },
        {
            title: "Trainer Performance",
            value: "4.8/5",
            subtext: "Top: Sarah Ahmed",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            href: "/operations/trainers"
        },
        {
            title: "Students Enrolled",
            value: "1,240",
            subtext: "Across 8 Active Courses",
            icon: BookOpen,
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            href: "/operations/trainers" // Or courses if exists, sticking to Trainers/Schedule for now
        },
        {
            title: "Incident Summary",
            value: "1 Active",
            subtext: "Severity: Medium",
            icon: ShieldAlert,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-900/20",
            href: "/operations/incidents"
        },
        {
            title: "SLA Compliance",
            value: "98.5%",
            subtext: "Avg Response: 12m",
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-900/20", // Fixed from 'bg -orange' typo
            href: "/operations/incidents"
        },
        {
            title: "Quality Score",
            value: "96%",
            subtext: "Excellent",
            icon: CheckCircle,
            color: "text-teal-600",
            bg: "bg-teal-50 dark:bg-teal-900/20",
            href: "/operations/quality"
        },
        {
            title: "Students at Risk",
            value: "15",
            subtext: "High Drop-out Risk",
            icon: AlertTriangle,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            href: "/operations/ai"
        },
        {
            title: "Tasks & Sessions",
            value: "45/50",
            subtext: "Daily Goals Met",
            icon: CheckSquare,
            color: "text-pink-600",
            bg: "bg-pink-50 dark:bg-pink-900/20",
            href: "/operations/tasks"
        },
        {
            title: "CS Complaints",
            value: "3 New",
            subtext: "Referred from Support",
            icon: ThumbsDown,
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            href: "/operations/quality"
        }
    ];

    return (
        <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Top Bar: Critical Status */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-500" />
                        OPS COMMAND
                    </h1>
                    <p className="text-xs text-gray-400 font-mono tracking-wider">SYSTEM STATUS: NORMAL</p>
                </div>
                <div className="flex gap-6 text-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Sessions Live</p>
                        <p className="text-3xl font-black text-blue-600 animate-pulse">{LIVE_STATS.active_sessions}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Students Online</p>
                        <p className="text-3xl font-black text-purple-600">{LIVE_STATS.online_students}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">SLA Met</p>
                        <p className="text-3xl font-black text-green-600">98%</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid (New Request) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {quickStats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => router.push(stat.href)}
                        className={`p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between group h-24`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-gray-400 truncate">{stat.title}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div>
                            <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                            <div className="text-[10px] text-gray-500 truncate">{stat.subtext}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-20rem)]">

                {/* Left Column: Incidents & Alerts (1/4) */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                        <AlertOctagon className="w-4 h-4 text-red-500" />
                        INCIDENTS
                        <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">1 Active</span>
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {INCIDENTS.map(inc => (
                            <div key={inc.id} onClick={() => router.push('/operations/incidents')} className="p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-lg cursor-pointer hover:bg-red-100 transition-colors">
                                <p className="font-bold text-sm text-red-900 dark:text-red-100">{inc.title}</p>
                                <div className="flex justify-between items-center mt-2 text-xs text-red-700 dark:text-red-300">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {inc.time}</span>
                                    <span className="px-1.5 py-0.5 bg-white/50 rounded uppercase font-bold">{inc.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Column: Map & Heatmap (2/4) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Visual Map Placeholder */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-0 overflow-hidden relative group">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/50 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
                            <span className="text-xs font-bold flex items-center gap-2"><MapIcon className="w-3 h-3" /> Campus Map (Live)</span>
                        </div>
                        {/* Simple CSS Pattern to simulate map */}
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 relative">
                            {/* Lab A */}
                            <div onClick={() => router.push('/operations/schedule')} className="absolute top-1/4 left-1/4 w-32 h-24 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                                <div className="text-center">
                                    <p className="font-bold text-xs text-green-700 dark:text-green-300">Lab A</p>
                                    <p className="text-[10px] text-green-600">Occupied</p>
                                </div>
                            </div>
                            {/* Lab B */}
                            <div className="absolute bottom-1/4 right-1/4 w-32 h-24 bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center opacity-50">
                                <div className="text-center">
                                    <p className="font-bold text-xs text-gray-500">Lab B</p>
                                    <p className="text-[10px]">Empty</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* AI Insights Ticker */}
                    <div onClick={() => router.push('/operations/ai')} className="h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center px-6 text-white shadow-lg overflow-hidden relative cursor-pointer hover:brightness-110 transition-all">
                        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-indigo-600 to-transparent z-10"></div>
                        <Zap className="w-5 h-5 mr-3 animate-pulse" />
                        <span className="font-bold mr-2">AI OP-MIND:</span>
                        <span className="text-sm font-medium opacity-90 truncate">Predicting 20% surge in support tickets at 2:00 PM due to system maintenance window. Suggest adding 1 Support Agent.</span>
                    </div>
                </div>

                {/* Right Column: Schedule & Quality (1/4) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Quality Score */}
                    <div onClick={() => router.push('/operations/quality')} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center cursor-pointer hover:border-green-500 transition-colors">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Daily Quality Score</p>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.96)} className="text-green-500" />
                            </svg>
                            <span className="absolute text-2xl font-black text-gray-900 dark:text-white">9.6</span>
                        </div>
                        <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Top 5% vs Average
                        </p>
                    </div>

                    {/* Up Next */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-primary" />
                            UP NEXT
                        </h3>
                        <div className="space-y-3">
                            {UPCOMING_SESSIONS.map(sess => (
                                <div key={sess.id} onClick={() => router.push('/operations/schedule')} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm truncate">{sess.title}</span>
                                        <span className="text-xs font-mono bg-white dark:bg-gray-800 px-1 rounded border shadow-sm">{sess.time}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex justify-between">
                                        <span>{sess.trainer}</span>
                                        <span>{sess.room}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
