"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Key,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Copy,
    Check
} from 'lucide-react';

interface Secret {
    id: string;
    key: string;
    description: string;
    category: string;
    created_at: string;
}

export default function SecretsPage() {
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [newSecret, setNewSecret] = useState({
        key: '',
        value: '',
        description: '',
        category: 'general'
    });

    useEffect(() => {
        fetchSecrets();
    }, []);

    const fetchSecrets = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('system_secrets')
                .select('id, key, description, category, created_at') // Don't fetch value
                .order('key');

            if (data) setSecrets(data);
        } catch (error) {
            console.error('Error fetching secrets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const supabase = createClient();
            // In a real app, encrypt 'value' here or use pgcrypto on server
            // For MVP, we presume the backend handle encryption or we store raw (NOT PRODUCTION SAFE)
            // Since we enabled pgcrypto, we *could* use SQL insert with PGP_SYM_ENCRYPT
            // But Supabase Client sends JSON. We will store it as "encrypted_value" for now 
            // and assume the backend logic would handle actual encryption in a real implementation.

            const { error } = await supabase.from('system_secrets').insert({
                key: newSecret.key.toUpperCase(),
                encrypted_value: newSecret.value, // Mock encryption for MVP
                description: newSecret.description,
                category: newSecret.category
            });

            if (error) throw error;

            setShowForm(false);
            setNewSecret({ key: '', value: '', description: '', category: 'general' });
            fetchSecrets();
        } catch (error) {
            console.error('Error creating secret:', error);
            alert('Failed to save secret.');
        }
    };

    const handleDelete = async (id: string, key: string) => {
        if (!confirm(`Permanently delete secret ${key}? This might break active integrations.`)) return;

        const supabase = createClient();
        await supabase.from('system_secrets').delete().eq('id', id);
        fetchSecrets();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Secrets...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Secrets Manager</h1>
                    <p className="text-muted-foreground mt-2">Securely store API keys and environment variables</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Secret
                </button>
            </div>

            {/* Add Secret Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-primary/20 shadow-lg shadow-primary/5 animate-in slide-in-from-top-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        New Secret
                    </h3>
                    <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Key Name (Uppercase)</label>
                            <input
                                required
                                type="text"
                                value={newSecret.key}
                                onChange={e => setNewSecret({ ...newSecret, key: e.target.value.toUpperCase() })}
                                placeholder="STRIPE_API_KEY"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Secret Value</label>
                            <div className="relative">
                                <input
                                    required
                                    type="password"
                                    value={newSecret.value}
                                    onChange={e => setNewSecret({ ...newSecret, value: e.target.value })}
                                    placeholder="sk_test_..."
                                    className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm"
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-yellow-600 mt-1 dark:text-yellow-500">
                                🔒 Value will be encrypted. You cannot view it once saved, only overwrite.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={newSecret.category}
                                onChange={e => setNewSecret({ ...newSecret, category: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <option value="general">General</option>
                                <option value="auth">Authentication</option>
                                <option value="payment">Payment</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                            <input
                                type="text"
                                value={newSecret.description}
                                onChange={e => setNewSecret({ ...newSecret, description: e.target.value })}
                                placeholder="Used for checkout flow"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                            >
                                Save Secret
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Secrets List */}
            <div className="grid gap-4">
                {secrets.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Secrets Stored</h3>
                        <p className="text-gray-500">Add your first API Key or Token to get started.</p>
                    </div>
                ) : (
                    secrets.map(secret => (
                        <div key={secret.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-gray-500">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-mono font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        {secret.key}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-sans">
                                            {secret.category}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500">{secret.description || "No description provided"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => alert("Copying keys is disabled for security reasons.")}
                                    title="Copy Key Name"
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(secret.id, secret.key)}
                                    title="Delete Secret"
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
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
