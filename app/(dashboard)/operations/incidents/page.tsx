"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    AlertOctagon,
    CheckCircle,
    Clock,
    Filter,
    Plus,
    Search,
    MoreVertical,
    FileText,
    ShieldAlert
} from 'lucide-react';

interface Incident {
    id: string;
    title: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    severity: 'critical' | 'high' | 'medium' | 'low';
    created_at: string;
    resolution_time?: string;
    root_cause?: string;
}

const SEVERITY_COLORS = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
};

const STATUS_COLS = ['open', 'investigating', 'resolved', 'closed'];

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newIncident, setNewIncident] = useState({ title: '', severity: 'medium', description: '' });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
        if (data) setIncidents(data as any);
        setLoading(false);
    };

    const handleCreate = async () => {
        const supabase = createClient();
        const { error } = await supabase.from('incidents').insert({
            title: newIncident.title,
            description: newIncident.description,
            severity: newIncident.severity,
            status: 'open'
        });
        if (!error) {
            setIsAddOpen(false);
            fetchIncidents();
        }
    };

    const updateStatus = async (id: string, status: string) => {
        const supabase = createClient();
        await supabase.from('incidents').update({ status }).eq('id', id);
        fetchIncidents();
    };

    return (
        <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                        Incident Response
                    </h1>
                    <p className="text-gray-500 mt-1">Track SLA compliance and system health.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-bold shadow-sm"
                >
                    <AlertOctagon className="w-5 h-5" />
                    Report Incident
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
                {STATUS_COLS.map(status => (
                    <div key={status} className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-bold uppercase text-xs text-gray-500 flex justify-between">
                            {status}
                            <span className="bg-white dark:bg-gray-800 px-2 rounded-full border shadow-sm">
                                {incidents.filter(i => i.status === status).length}
                            </span>
                        </div>
                        <div className="p-2 space-y-2 overflow-y-auto flex-1">
                            {incidents.filter(i => i.status === status).map(inc => (
                                <div key={inc.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[inc.severity]}`}>
                                            {inc.severity}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">{inc.title}</h4>

                                    {/* Action Buttons (Mockup) */}
                                    <div className="flex gap-1 pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 opacity-50 group-hover:opacity-100 transition-opacity">
                                        {status !== 'resolved' && (
                                            <button onClick={() => updateStatus(inc.id, 'resolved')} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 w-full text-center">
                                                Resolve
                                            </button>
                                        )}
                                        {status === 'resolved' && (
                                            <button onClick={() => updateStatus(inc.id, 'closed')} className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 w-full text-center">
                                                Close
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Manual Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4">Report New Incident</h3>
                        <div className="space-y-4">
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Issue Title (e.g. Zoom Outage)"
                                value={newIncident.title}
                                onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
                            />
                            <textarea
                                className="w-full p-2 border rounded"
                                placeholder="Description..."
                                rows={3}
                                value={newIncident.description}
                                onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={newIncident.severity}
                                onChange={e => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
