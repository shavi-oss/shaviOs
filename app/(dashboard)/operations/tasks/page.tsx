"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    CheckSquare,
    Clock,
    MoreHorizontal,
    Plus,
    User
} from 'lucide-react';

interface OpsTask {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'qa' | 'completed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    tags?: string[];
}

const COLUMNS = [
    { id: 'todo', label: 'To Do', color: 'border-gray-300' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-400' },
    { id: 'qa', label: 'QA / Review', color: 'border-purple-400' },
    { id: 'completed', label: 'Done', color: 'border-green-400' }
];

export default function OpsTasksPage() {
    const [tasks, setTasks] = useState<OpsTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('ops_tasks').select('*').order('created_at', { ascending: false });
        if (data) setTasks(data as any);
        setLoading(false);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const supabase = createClient();
        const { error } = await supabase.from('ops_tasks').insert({
            title: newTaskTitle,
            status: 'todo',
            priority: 'normal'
        });

        if (!error) {
            setNewTaskTitle('');
            fetchTasks();
        }
    };

    const moveTask = async (id: string, newStatus: string) => {
        const supabase = createClient();
        await supabase.from('ops_tasks').update({ status: newStatus }).eq('id', id);
        fetchTasks();
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <CheckSquare className="w-8 h-8 text-primary" />
                    Ops Task Force
                </h1>
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-64"
                        placeholder="Add new task..."
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                    />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium">Add</button>
                </form>
            </div>

            <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex flex-col h-full">
                        <div className={`flex items-center justify-between mb-3 px-1 border-b-2 ${col.color} pb-2`}>
                            <h3 className="font-bold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">{col.label}</h3>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 font-mono">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
                                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                                                task.priority === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        {col.id !== 'completed' && (
                                            <button
                                                onClick={() => moveTask(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)}
                                                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                            >
                                                Next &rarr;
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
