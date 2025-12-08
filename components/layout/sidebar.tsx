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
    Wrench
} from "lucide-react";

interface SidebarProps {
    userRole: string;
}

const navigationItems = [
    { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
    { name: "التسويق", href: "/marketing", icon: BarChart3 },
    { name: "المبيعات", href: "/sales", icon: Briefcase },
    { name: "نجاح العملاء", href: "/customer-success", icon: HeartHandshake },
    { name: "الطلاب", href: "/customer-success/students", icon: GraduationCap },
    { name: "المالية", href: "/finance", icon: DollarSign },
    { name: "الموارد البشرية", href: "/hr", icon: Users },
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
                    {navigationItems.map((item) => {
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
