"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, LogOut, Loader2, X } from "lucide-react";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
    user: {
        full_name?: string;
        email: string;
        role?: string;
    };
}

interface SearchResult {
    type: 'lead' | 'student' | 'deal';
    id: string;
    title: string;
    subtitle: string;
    url: string;
    status: string;
}

export function Header({ user }: HeaderProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'lead': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'student': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'deal': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'lead': return 'عميل محتمل';
            case 'student': return 'طالب';
            case 'deal': return 'صفقة';
            default: return type;
        }
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                            placeholder="بحث شامل (عملاء، طلاب، صفقات)..."
                            className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        {loading && (
                            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                        )}
                        {query && !loading && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full right-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
                            {results.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {results.map((result) => (
                                        <Link
                                            key={`${result.type}-${result.id}`}
                                            href={result.url}
                                            onClick={() => setShowResults(false)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getIconColor(result.type)}`}>
                                                {result.type === 'lead' ? 'L' : result.type === 'student' ? 'S' : 'D'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {result.title}
                                                    </p>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                                                        {getTypeLabel(result.type)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {result.subtitle} • {result.status}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    {query.length < 2 ? 'اكتب حرفين على الأقل' : 'لا توجد نتائج مطابقة'}
                                </div>
                            )}
                        </div>
                    )}
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
