"use client";

import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Briefcase,
    HeartHandshake,
    Users,
    ClipboardList,
    Wrench,
    ArrowRight,
    TrendingUp,
    Shield,
    Bell,
    DollarSign
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLandingPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserRole(user.user_metadata?.role || 'user');
                // If user is just 'user' with no role, maybe show a "Contact Admin" state?
                // For now, allow them to see the dashboard but links might be blocked by middleware if clicked.
            }
            setLoading(false);
        }
        getUser();
    }, []);

    const modules = [
        {
            title: "Marketing",
            description: "Campaigns, Social, Ads",
            icon: BarChart3,
            href: "/marketing",
            color: "bg-pink-600",
            bg: "bg-pink-50 dark:bg-pink-900/20",
            role: ['admin', 'manager', 'sales']
        },
        {
            title: "Sales CRM",
            description: "Pipeline, Deals, Quotes",
            icon: Briefcase,
            href: "/sales",
            color: "bg-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            role: ['admin', 'manager', 'sales']
        },
        {
            title: "Customer Success",
            description: "Tickets, Support, KB",
            icon: HeartHandshake,
            href: "/customer-success",
            color: "bg-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            role: ['admin', 'manager', 'sales', 'customer_success']
        },
        {
            title: "Operations",
            description: "Schedule, Trainers, Quality",
            icon: ClipboardList,
            href: "/operations",
            color: "bg-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            role: ['admin', 'manager', 'operations', 'trainer']
        },
        {
            title: "HR & Finance",
            description: "Employees, Payroll, Invoices",
            icon: Users,
            href: "/hr",
            color: "bg-orange-600",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            role: ['admin', 'manager', 'hr']
        },
        {
            title: "Tech Panel",
            description: "System Settings, Logs, Roles",
            icon: Wrench,
            href: "/tech-panel",
            color: "bg-gray-800",
            bg: "bg-gray-100 dark:bg-gray-800",
            role: ['admin', 'developer']
        }
    ];

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    const visibleModules = modules.filter(m => {
        if (!userRole) return false;
        if (userRole === 'admin' || userRole === 'developer') return true;
        if (userRole === 'manager' && m.href !== '/tech-panel') return true;
        return m.role.includes(userRole);
    });

    return (
        <div className="p-6 space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2">Welcome to Shavi ERP</h1>
                    <p className="text-indigo-200 text-lg max-w-xl">
                        Your enterprise command center is ready. Access your department modules below.
                    </p>

                    <div className="flex gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                            <p className="text-xs text-indigo-200 uppercase font-bold">System Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <span className="font-bold">All Systems Operational</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                            <p className="text-xs text-indigo-200 uppercase font-bold">Your Role</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4 text-yellow-400" />
                                <span className="font-bold capitalize">{userRole}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-gray-400" />
                    Your Applications
                </h2>

                {visibleModules.length === 0 ? (
                    <div className="p-8 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                        <h3 className="font-bold">Access Restricted</h3>
                        <p>Your account ({userRole}) does not have access to any specific modules yet. Please contact an Administrator to assign a proper role.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleModules.map((module) => (
                            <div
                                key={module.title}
                                onClick={() => router.push(module.href)}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${module.bg} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>

                                <div className={`w-12 h-12 ${module.bg} ${module.color.replace('bg-', 'text-')} rounded-xl flex items-center justify-center mb-4 text-xl`}>
                                    <module.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    {module.description}
                                </p>

                                <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-primary transition-colors">
                                    Launch Module <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity / Universal Updates */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-400" />
                        System Updates
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="mt-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                            <div>
                                <h4 className="font-bold text-sm">Customer Support Module Launched</h4>
                                <p className="text-xs text-gray-500 mt-1">New ticketing system is now live. Access it from the Customer Success card.</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">2 hours ago</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="mt-1"><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
                            <div>
                                <h4 className="font-bold text-sm">Payroll Processed</h4>
                                <p className="text-xs text-gray-500 mt-1">HR has finalized the December payroll batch.</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Quick Stats
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Revenue (Dec)</p>
                            <p className="text-2xl font-black text-green-400 flex items-center gap-1">
                                $124,500 <span className="text-xs text-white bg-white/20 px-1 rounded">+12%</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Active Students</p>
                            <p className="text-2xl font-black text-blue-400">1,204</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Open Tickets</p>
                            <p className="text-2xl font-black text-orange-400">24</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
