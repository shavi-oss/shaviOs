"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { useRouter } from "next/navigation";

interface HeaderProps {
    user: {
        full_name?: string;
        email: string;
        role?: string;
    };
}

export function Header({ user }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="search"
                            placeholder="ابحث..."
                            className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <button
                        className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pr-3 border-r border-gray-200 dark:border-gray-800">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.full_name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.role || "Member"}
                            </p>
                        </div>
                        <div className="relative group">
                            <button
                                className="flex items-center justify-center w-9 h-9 bg-primary/10 text-primary rounded-full font-medium text-sm"
                                aria-label="User menu"
                            >
                                {user.full_name
                                    ? user.full_name.charAt(0).toUpperCase()
                                    : <User className="w-5 h-5" />
                                }
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user.full_name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
