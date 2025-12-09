"use client";

import { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Edit,
    Activity,
    Globe,
    CheckCircle,
    XCircle,
    TestTube
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    is_active: boolean;
    retry_count: number;
    created_at: string;
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('webhooks')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setWebhooks(data);
        } catch (error) {
            console.error('Error fetching webhooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWebhook = async (id: string, currentState: boolean) => {
        const supabase = createClient();
        await supabase.from('webhooks').update({ is_active: !currentState }).eq('id', id);
        fetchWebhooks(); // Refresh
    };

    const deleteWebhook = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;
        const supabase = createClient();
        await supabase.from('webhooks').delete().eq('id', id);
        fetchWebhooks();
    };

    const triggerTest = async (url: string) => {
        // In a real app, this would call a backend API to send a test payload
        alert(`Simulating test event to: ${url}`);
    };

    if (loading) {
        return <div className="p-10 text-center">Loading Webhooks...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Webhooks</h1>
                    <p className="text-muted-foreground mt-2">Manage outbound event notifications</p>
                </div>
                <Link
                    href="/tech-panel/webhooks/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Webhook
                </Link>
            </div>

            <div className="grid gap-4">
                {webhooks.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-10 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Webhooks Configured</h3>
                        <p className="text-gray-500 mt-1">Create your first webhook to start receiving system events.</p>
                    </div>
                ) : (
                    webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {webhook.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-gray-50 dark:bg-gray-900 w-fit px-2 py-1 rounded">
                                    <Globe className="w-3 h-3" />
                                    {webhook.url}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {webhook.events.map(event => (
                                        <span key={event} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">
                                            {event}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => triggerTest(webhook.url)}
                                    title="Send Test Payload"
                                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 rounded-lg transition-colors border border-purple-100 dark:border-purple-900/30"
                                >
                                    <TestTube className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                                    title={webhook.is_active ? "Disable" : "Enable"}
                                    className={`p-2 rounded-lg transition-colors border ${webhook.is_active ? 'hover:bg-yellow-50 text-yellow-600 border-yellow-100' : 'hover:bg-green-50 text-green-600 border-green-100'}`}
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    title="Edit"
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteWebhook(webhook.id)}
                                    title="Delete"
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
