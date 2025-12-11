"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    DollarSign,
    UserCircle,
    Settings,
    BarChart3,
    Briefcase,
    HeartHandshake,
    ChevronLeft,
    ChevronRight,
    Wrench,
    ClipboardList,
    MessageSquare,
    BarChart,
    Layout,
    Target,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    Award,
    FileText,
    CheckSquare,
    Upload
} from "lucide-react";

interface SidebarProps {
    userRole: string;
}

const navigationItems = [
    { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
    { name: "التسويق", href: "/marketing", icon: BarChart3 },
    { name: "المبيعات", href: "/sales", icon: Briefcase },
    { name: "صفقاتي", href: "/sales/my-deals", icon: Target },
    { name: "خط الأنابيب", href: "/sales/pipeline", icon: TrendingUp },
    { name: "محرك SLA", href: "/sales/sla-engine", icon: Clock },
    { name: "نجاح العملاء", href: "/customer-success", icon: HeartHandshake }, // Dashboard
    { name: "قائمتي", href: "/customer-success/my-queue", icon: ClipboardList }, // My Queue
    { name: "التذاكر", href: "/customer-success/tickets", icon: MessageSquare }, // All Tickets
    { name: "الأداء", href: "/customer-success/performance", icon: BarChart }, // Performance
    { name: "توزيع المهام", href: "/customer-success/workload", icon: Layout }, // Workload
    { name: "الطلاب", href: "/customer-success/students", icon: GraduationCap },
    { name: "الموارد البشرية", href: "/hr/employees", icon: Users },
    { name: "الإجازات", href: "/hr/leave", icon: Calendar },
    { name: "الرواتب", href: "/hr/payroll", icon: DollarSign },
    { name: "الأداء", href: "/hr/performance", icon: Award },
    { name: "تحليلات HR", href: "/hr/analytics", icon: BarChart3 },
    { name: "التقارير", href: "/hr/reports", icon: FileText },
    { name: "المالية", href: "/finance", icon: DollarSign },
    { name: "الفواتير", href: "/finance/invoices", icon: FileText },
    { name: "المصروفات", href: "/finance/expenses", icon: TrendingDown },
    { name: "المدربين", href: "/operations/trainers", icon: GraduationCap },
    { name: "الجلسات", href: "/operations/trainers/sessions", icon: Calendar },
    { name: "الواجبات", href: "/operations/trainers/assignments", icon: FileText },
    { name: "الحضور", href: "/operations/trainers/attendance", icon: CheckSquare },
    { name: "الملفات", href: "/operations/trainers/files", icon: Upload },
    { name: "الأرباح", href: "/operations/trainers/earnings", icon: DollarSign },
    { name: "العمليات", href: "/operations", icon: ClipboardList },
    { name: "لوحة التقنية", href: "/tech-panel", icon: Wrench },
];

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`fixed right-0 top-0 h-screen bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${isCollapsed ? "w-20" : "w-64"
                    } hidden lg:block`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold text-primary">
                            Shavi Academy
                        </h1>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navigationItems.filter(item => {
                        // Admin, Developer, and Manager see everything (except Tech Panel is restricted further)
                        if (['admin', 'developer'].includes(userRole)) return true;

                        // Managers see all except Tech Panel
                        if (userRole === 'manager' && item.href === '/tech-panel') return false;
                        if (userRole === 'manager') return true;

                        // Specific Role Access
                        if (userRole === 'sales' && ['/marketing', '/sales', '/customer-success', '/customers'].includes(item.href)) return true;
                        if (userRole === 'hr' && ['/hr', '/finance'].includes(item.href)) return true; // HR usually manages payroll
                        if (userRole === 'operations' && ['/operations', '/trainers', '/schedule'].includes(item.href)) return true;
                        if (userRole === 'trainer' && ['/operations'].includes(item.href)) return true; // Trainers need Ops for schedule

                        // Dashboard is always visible
                        if (item.href === '/') return true;

                        return false;
                    }).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                    }`} />
                                {!isCollapsed && (
                                    <span className="text-sm">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${pathname === "/settings"
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        title={isCollapsed ? "الإعدادات" : undefined}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm">الإعدادات</span>}
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {navigationItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? "text-primary"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                <Icon className="w-5 h-5 mb-1" />
                                <span className="text-xs">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
