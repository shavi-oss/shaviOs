"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, ArrowRight } from 'lucide-react';

const AVAILABLE_EVENTS = [
    'lead.created', 'lead.updated',
    'student.enrolled', 'student.completed',
    'deal.created', 'deal.won', 'deal.lost',
    'payment.received', 'invoice.created'
];

export default function NewWebhookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        events: [] as string[],
        secret_header: ''
    });

    const toggleEvent = (event: string) => {
        setFormData(prev => {
            const events = prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event];
            return { ...prev, events };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.from('webhooks').insert([
                {
                    name: formData.name,
                    url: formData.url,
                    events: formData.events,
                    secret_header: formData.secret_header || null,
                    is_active: true
                }
            ]);

            if (error) throw error;
            router.push('/tech-panel/webhooks');
        } catch (error) {
            console.error('Error creating webhook:', error);
            alert('Failed to create webhook. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to Webhooks
                </button>
                <h1 className="text-3xl font-bold text-foreground">Create Webhook</h1>
                <p className="text-muted-foreground mt-1">Configure a new outbound notification endpoint</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium mb-2">Friendly Name</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. CRM Sync"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                    <input
                        required
                        type="url"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://api.example.com/webhooks/receiver"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Secret Header (Optional)</label>
                    <input
                        type="text"
                        value={formData.secret_header}
                        onChange={e => setFormData({ ...formData, secret_header: e.target.value })}
                        placeholder="X-Signature-Key (For verification)"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Trigger Events</label>
                    <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_EVENTS.map(event => (
                            <label key={event} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.events.includes(event)}
                                    onChange={() => toggleEvent(event)}
                                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                                />
                                <span className="text-sm font-mono">{event}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-70"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Create Webhook
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
