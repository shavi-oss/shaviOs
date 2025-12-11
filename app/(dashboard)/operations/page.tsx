"use client";

import { useRouter } from 'next/navigation';
import {
    Calendar,
    Users,
    ClipboardCheck,
    BookOpen,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Activity,
    ShieldAlert,
    CheckSquare,
    BrainCircuit
} from 'lucide-react';

export default function OperationsDashboard() {
    const router = useRouter();

    const sections = [
        {
            title: "جدول الحصص",
            description: "إدارة المواعيد والقاعات الدراسية",
            icon: Calendar,
            href: "/operations/schedule",
            color: "bg-blue-500",
            stats: "12 Sessions"
        },
        {
            title: "غرفة القيادة",
            description: "Operations Command Center",
            icon: Activity,
            href: "/operations/command",
            color: "bg-red-500",
            stats: "Live Pulse"
        },
        {
            title: "إدارة الحوادث",
            description: "Incidents & SLA Tracking",
            icon: ShieldAlert,
            href: "/operations/incidents",
            color: "bg-orange-500",
            stats: "1 Active"
        },
        {
            title: "المهام الداخلية",
            description: "Ops Task Force Kanban",
            icon: CheckSquare,
            href: "/operations/tasks",
            color: "bg-indigo-500",
            stats: "8 Tasks"
        },
        {
            title: "المدربين",
            description: "سجلات المدربين والرواتب",
            icon: Users,
            href: "/operations/trainers",
            color: "bg-purple-500",
            stats: "8 Active"
        },
        {
            title: "جودة التعليم",
            description: "تقييمات الطلاب ومراقبة الجودة",
            icon: ClipboardCheck,
            href: "/operations/quality",
            color: "bg-green-500",
            stats: "4.8/5 Avg"
        },
        {
            title: "الذكاء الاصطناعي",
            description: "AI Predictions & Insights",
            icon: BrainCircuit,
            href: "/operations/ai",
            color: "bg-pink-500",
            stats: "GPT-4 Active"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة العمليات (Operations)</h1>
                    <p className="text-gray-500 mt-2">مركز التحكم في الجداول، المدربين، والجودة الأكاديمية.</p>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.href}
                        onClick={() => router.push(section.href)}
                        className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all hover:border-primary/50 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${section.color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${section.color} bg-opacity-10 text-${section.color.split('-')[1]}-600`}>
                                <section.icon className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 h-10">
                            {section.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-900 py-2 px-3 rounded-lg w-fit">
                            <TrendingUp className="w-3 h-3" />
                            {section.stats}
                        </div>
                    </div>
                ))}
            </div>

            {/* Operational Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold mb-4">Live Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium">Lab A (Mac Phone)</span>
                            </div>
                            <span className="text-xs text-green-700 dark:text-green-300">Occupied (React Course)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-gray-300" />
                                <span className="text-sm font-medium">Lab B (Windows)</span>
                            </div>
                            <span className="text-xs text-gray-500">Available</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Operational Alerts
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            • <span className="font-bold text-red-500">Urgent:</span> Projector in Lab B needs maintenance.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            • Trainer "Ahmed Ali" requested leave for Next Sunday.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
