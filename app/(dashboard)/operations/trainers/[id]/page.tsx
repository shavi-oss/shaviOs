"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import {
    Award,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Globe,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    TrendingUp,
    User
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

// --- Types ---
interface TrainerDetails {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    email: string;
    phone: string;
    bio: string;
    hourly_rate: number;
    contract_type: string;
    experience_years: number;
    linkedin_url?: string;
    portfolio_url?: string;
    cv_url?: string;
    join_date: string;
}

export default function TrainerProfilePage() {
    const { id } = useParams();
    const [trainer, setTrainer] = useState<TrainerDetails | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Mock Data for Tabs
    const PAYROLL_HISTORY = [
        { id: 1, month: 'Nov 2025', sessions: 24, amount: 12000, status: 'paid' },
        { id: 2, month: 'Dec 2025', sessions: 12, amount: 6000, status: 'pending' },
    ];

    const SKILLS = [
        { name: 'React.js', level: 5 },
        { name: 'Node.js', level: 4 },
        { name: 'UX Design', level: 3 },
    ];

    useEffect(() => {
        if (id) fetchTrainer();
    }, [id]);

    const fetchTrainer = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('trainers').select('*').eq('id', id).single();
        if (data) setTrainer(data as any);
        setLoading(false);
    };

    if (loading) return <div className="p-10">Loading Profile...</div>;
    if (!trainer) return <div className="p-10">Trainer not found</div>;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header / Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 shrink-0">
                    {trainer.first_name[0]}{trainer.last_name[0]}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{trainer.first_name} {trainer.last_name}</h1>
                            <p className="text-primary font-medium flex items-center gap-2">
                                {trainer.specialization}
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full capitalize">
                                    {trainer.contract_type}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {trainer.linkedin_url && <a href={trainer.linkedin_url} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Linkedin className="w-5 h-5" /></a>}
                            {trainer.portfolio_url && <a href={trainer.portfolio_url} target="_blank" className="p-2 bg-green-50 text-green-600 rounded-lg"><Globe className="w-5 h-5" /></a>}
                            {trainer.cv_url && <a href={trainer.cv_url} target="_blank" className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText className="w-5 h-5" /></a>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-4 h-4" /> {trainer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4" /> {trainer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" /> Joined {new Date(trainer.join_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold text-green-600">
                            <DollarSign className="w-4 h-4" /> {trainer.hourly_rate} EGP/hr
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex gap-6">
                {['overview', 'schedule', 'financials', 'performance'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- TAB CONTENT --- */}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Bio & Skills */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold mb-4">About Trainer</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {trainer.bio || "No biography added yet."}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold mb-4">Skills Matrix</h3>
                            <div className="space-y-4">
                                {SKILLS.map(skill => (
                                    <div key={skill.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{skill.name}</span>
                                            <span className="text-gray-400">{skill.level}/5</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <StatCard title="Overall Rating" value="4.9" icon={Star} description="Based on 45 reviews" />
                        <StatCard title="Experience" value={`${trainer.experience_years} Years`} icon={Award} description="Senior Level" />
                        <StatCard title="Projects" value="12" icon={ShieldCheck} description="Completed Courses" />
                    </div>
                </div>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Payroll History</h3>
                        <button className="text-sm bg-primary/10 text-primary px-3 py-1 rounded font-bold">Generate Report</button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Sessions</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {PAYROLL_HISTORY.map((pym, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="px-6 py-4 font-medium">{pym.month}</td>
                                    <td className="px-6 py-4">{pym.sessions}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-green-600">{pym.amount.toLocaleString()} EGP</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${pym.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {pym.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium">View Slip</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === 'schedule' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Classes</h3>
                    <p>No classes scheduled for this week.</p>
                    <button className="mt-4 text-primary font-bold">Assign to Class</button>
                </div>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Analytics</h3>
                    <p>Performance charts will be generated after 1 month of activity.</p>
                </div>
            )}
        </div>
    );
}
