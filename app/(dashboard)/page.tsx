"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import {
    Users,
    UserPlus,
    GraduationCap,
    DollarSign,
    CheckCircle,
    TrendingUp,
    Calendar,
} from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { DraggableGrid, DashboardWidget } from "@/components/dashboard/draggable-grid";
import { DashboardCustomizer } from "@/components/settings/dashboard-customizer";

export default function DashboardPage() {
    // Mock data - will be replaced with real data from API
    const stats = {
        totalLeads: 245,
        newLeadsToday: 12,
        totalStudents: 1834,
        activeStudents: 1654,
        totalRevenue: 2450000,
        revenueThisMonth: 345000,
        pendingTasks: 23,
        completedTasksToday: 8,
    };

    // Define draggable widgets
    const statWidgets: DashboardWidget[] = [
        {
            id: "leads-stat",
            title: "إجمالي العملاء المحتملين",
            category: "إحصائيات",
            component: (
                <StatCard
                    title="إجمالي العملاء المحتملين"
                    value={stats.totalLeads}
                    icon={Users}
                    description={`${stats.newLeadsToday} عميل جديد اليوم`}
                    trend={{ value: 12.5, isPositive: true }}
                />
            ),
        },
        {
            id: "students-stat",
            title: "الطلاب النشطون",
            category: "إحصائيات",
            component: (
                <StatCard
                    title="الطلاب النشطون"
                    value={stats.activeStudents}
                    icon={GraduationCap}
                    description={`من ${stats.totalStudents} طالب إجمالي`}
                    trend={{ value: 5.2, isPositive: true }}
                />
            ),
        },
        {
            id: "revenue-stat",
            title: "الإيرادات هذا الشهر",
            category: "إحصائيات",
            component: (
                <StatCard
                    title="الإيرادات هذا الشهر"
                    value={`${(stats.revenueThisMonth / 1000).toFixed(0)}K جنيه`}
                    icon={DollarSign}
                    description={`من ${(stats.totalRevenue / 1000).toFixed(0)}K إجمالي`}
                    trend={{ value: 8.3, isPositive: true }}
                />
            ),
        },
        {
            id: "tasks-stat",
            title: "المهام المنجزة",
            category: "إحصائيات",
            component: (
                <StatCard
                    title="المهام المنجزة"
                    value={stats.completedTasksToday}
                    icon={CheckCircle}
                    description={`${stats.pendingTasks} مهمة قيد الانتظار`}
                    trend={{ value: 3.1, isPositive: false }}
                />
            ),
        },
    ];

    const contentWidgets: DashboardWidget[] = [
        {
            id: "recent-activity",
            title: "النشاط الأخير",
            category: "محتوى",
            component: (
                <GlassCard intensity="medium" hover className="h-full">
                    <GlassCardHeader>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            النشاط الأخير
                        </h2>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="space-y-4">
                            {[
                                { type: "lead", text: "عميل جديد: أحمد محمد", time: "منذ 5 دقائق" },
                                { type: "payment", text: "دفعة جديدة: 5,000 جنيه", time: "منذ 15 دقيقة" },
                                { type: "student", text: "طالب جديد: سارة علي", time: "منذ 30 دقيقة" },
                                { type: "session", text: "جلسة مكتملة: دورة البرمجة", time: "منذ ساعة" },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.text}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCardContent>
                </GlassCard>
            ),
        },
        {
            id: "today-tasks",
            title: "مهام اليوم",
            category: "محتوى",
            component: (
                <GlassCard intensity="medium" hover className="h-full">
                    <GlassCardHeader>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            مهام اليوم
                        </h2>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="space-y-3">
                            {[
                                { title: "متابعة 3 عملاء جدد", time: "10:00 صباحاً", priority: "high" },
                                { title: "اجتماع فريق المبيعات", time: "11:00 صباحاً", priority: "medium" },
                                { title: "تقرير أداء الأسبوع", time: "3:00 مساءً", priority: "low" },
                            ].map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                                >
                                    <input type="checkbox" className="w-4 h-4 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.time}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${task.priority === "high"
                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                : task.priority === "medium"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            }`}
                                    >
                                        {task.priority === "high" ? "عاجل" : task.priority === "medium" ? "متوسط" : "عادي"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCardContent>
                </GlassCard>
            ),
        },
        {
            id: "quick-actions",
            title: "إجراءات سريعة",
            category: "محتوى",
            component: (
                <GlassCard intensity="light" hover className="h-full">
                    <GlassCardHeader>
                        <h2 className="text-lg font-semibold">إجراءات سريعة</h2>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {[
                                { icon: UserPlus, label: "إضافة عميل جديد", color: "bg-blue-500" },
                                { icon: GraduationCap, label: "تسجيل طالب", color: "bg-green-500" },
                                { icon: Calendar, label: "جدولة جلسة", color: "bg-purple-500" },
                                { icon: DollarSign, label: "تسجيل دفعة", color: "bg-primary" },
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                                >
                                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </GlassCardContent>
                </GlassCard>
            ),
        },
    ];

    // Widget configuration for customizer
    const widgetConfig = [
        ...statWidgets.map(w => ({ id: w.id, title: w.title, visible: true, category: w.category })),
        ...contentWidgets.map(w => ({ id: w.id, title: w.title, visible: true, category: w.category })),
    ];

    return (
        <div className="flex flex-col gap-6 p-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    مرحباً بك في Shavi Academy OS 🎯
                </h1>
                <p className="text-muted-foreground mt-2">
                    نظام إدارة أكاديمي متكامل - لوحة التحكم الرئيسية
                </p>
            </div>

            {/* Draggable Stats Grid */}
            <DraggableGrid
                widgets={statWidgets}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                storageKey="dashboard-stats-layout"
            />

            {/* Draggable Content Grid */}
            <DraggableGrid
                widgets={contentWidgets}
                className="grid gap-4 md:grid-cols-1 lg:grid-cols-3"
                storageKey="dashboard-content-layout"
            />

            {/* Dashboard Customizer */}
            <DashboardCustomizer widgets={widgetConfig} />
        </div>
    );
}
