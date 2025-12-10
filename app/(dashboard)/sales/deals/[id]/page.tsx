"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Phone, Mail, Calendar, Clock, FileText, Plus, Building2,
    DollarSign, Target, ArrowRight, CheckSquare, Paperclip,
    MessageSquare, History, Upload, Trash2, X
} from 'lucide-react';

export default function DealDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [deal, setDeal] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [activeTab, setActiveTab] = useState<'activity' | 'tasks' | 'files'>('activity');
    const [noteContent, setNoteContent] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchDealData();
    }, []);

    const fetchDealData = async () => {
        const { data: dealData } = await supabase.from('deals').select('*').eq('id', params.id).single();
        if (dealData) {
            setDeal(dealData);
            // Fetch related
            const { data: act } = await supabase.from('deal_activities').select('*').eq('deal_id', params.id).order('occurred_at', { ascending: false });
            const { data: tsk } = await supabase.from('tasks').select('*').eq('related_to_id', params.id).order('created_at', { ascending: false });
            const { data: fls } = await supabase.from('deal_files').select('*').eq('deal_id', params.id).order('created_at', { ascending: false });

            setActivities(act || []);
            setTasks(tsk || []);
            setFiles(fls || []);
        }
        setLoading(false);
    };

    const addActivity = async (type: string, content: string) => {
        await supabase.from('deal_activities').insert({
            deal_id: deal.id,
            type,
            content,
            occurred_at: new Date().toISOString()
        });
        fetchDealData();
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await supabase.from('tasks').insert({
            title: newTaskTitle,
            status: 'pending',
            priority: 'normal',
            related_to_id: deal.id,
            related_to_type: 'deal'
        });

        await addActivity('status_change', `Added task: ${newTaskTitle}`);
        setNewTaskTitle('');
        fetchDealData();
    };

    const toggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        fetchDealData();
    };

    const handleFileUpload = async () => {
        // Simulation
        const fileName = `Document-${Date.now()}.pdf`;
        await supabase.from('deal_files').insert({
            deal_id: deal.id,
            name: fileName,
            url: '#',
            size: 1024 * 500, // 500kb
            type: 'application/pdf'
        });
        await addActivity('note', `Uploaded file: ${fileName}`);
        fetchDealData();
    };

    if (loading) return <div className="p-8 text-center">Loading deal...</div>;
    if (!deal) return <div className="p-8 text-center">Deal not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Top Nav */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <button onClick={() => router.push('/sales/pipeline')} className="hover:text-primary">Pipeline</button>
                <span>/</span>
                <span>{deal.title}</span>
            </div>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex gap-2 items-center mb-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-bold uppercase tracking-wide border ${deal.stage === 'closed_won' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {deal.stage.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400 text-xs">Created {new Date(deal.created_at).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{deal.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {deal.customer_company || 'No Company'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {deal.customer_name}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {deal.value.toLocaleString()} <span className="text-sm text-gray-400 font-normal">EGP</span>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={() => router.push(`/sales/quotes/new?deal_id=${deal.id}`)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                Create Quote
                            </button>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                                Mark Won
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6">
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <History className="w-4 h-4" /> Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <CheckSquare className="w-4 h-4" /> Tasks ({tasks.filter(t => t.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Paperclip className="w-4 h-4" /> Files ({files.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">

                        {/* ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <div className="space-y-6">
                                <div className="flex gap-2 mb-6">
                                    <textarea
                                        className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20"
                                        placeholder="Write a note..."
                                        rows={2}
                                        value={noteContent}
                                        onChange={e => setNoteContent(e.target.value)}
                                        onKeyDown={async e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (noteContent.trim()) {
                                                    await addActivity('note', noteContent);
                                                    setNoteContent('');
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                    {activities.map(act => (
                                        <div key={act.id} className="relative flex gap-4 pl-0">
                                            <div className="absolute left-0 mt-1 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center z-10">
                                                {act.type === 'note' && <MessageSquare className="w-3 h-3 text-gray-500" />}
                                                {act.type === 'status_change' && <History className="w-3 h-3 text-blue-500" />}
                                                {act.type === 'call' && <Phone className="w-3 h-3 text-green-500" />}
                                            </div>
                                            <div className="pl-12 w-full">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{act.content}</p>
                                                    <p className="text-xs text-gray-400 mt-2">{new Date(act.occurred_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TASKS TAB */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-4">
                                <form onSubmit={handleAddTask} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded-lg px-4 py-2 text-sm"
                                        placeholder="Add a new task..."
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                    />
                                    <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Add</button>
                                </form>
                                <div className="divide-y divide-gray-100">
                                    {tasks.map(task => (
                                        <div key={task.id} className="py-3 flex items-center gap-3">
                                            <button
                                                onClick={() => toggleTask(task.id, task.status)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                                                    }`}
                                            >
                                                {task.status === 'completed' && <CheckSquare className="w-3 h-3" />}
                                            </button>
                                            <span className={`text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {task.title}
                                            </span>
                                            {task.priority === 'high' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-auto">High Priority</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FILES TAB */}
                        {activeTab === 'files' && (
                            <div className="space-y-4">
                                <div
                                    onClick={handleFileUpload}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click to simulate file upload</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="p-2 bg-red-50 text-red-600 rounded">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB • {new Date(file.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Client Info</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Company</label>
                                <input type="text" value={deal.customer_company || ''} readOnly className="w-full text-sm font-medium bg-transparent border-none p-0 focus:ring-0" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Contact Name</label>
                                <input type="text" value={deal.customer_name} readOnly className="w-full text-sm font-medium bg-transparent border-none p-0 focus:ring-0" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Email</label>
                                <div className="flex justify-between items-center group">
                                    <span className="text-sm">client@example.com</span>
                                    <Mail className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                                <div className="flex justify-between items-center group">
                                    <span className="text-sm">+20 123 456 7890</span>
                                    <Phone className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
                        <h3 className="font-bold text-lg mb-1">Forecast</h3>
                        <p className="text-indigo-100 text-sm mb-4">Win Probability</p>
                        <div className="text-4xl font-black mb-2">65%</div>
                        <p className="text-xs opacity-80">Based on stage "Proposal"</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
