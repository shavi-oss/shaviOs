"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Check,
    RefreshCcw,
    Settings,
    Zap,
    Plus,
    X,
    MessageSquare,
    Database,
    Cloud,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';

// Supported "Plugins" definitions
const AVAILABLE_SERVICES = [
    {
        slug: 'telegram',
        name: 'Telegram',
        description: 'Send notifications to a Telegram Channel or Group.',
        icon: MessageSquare,
        category: 'communication',
        fields: [
            { key: 'chat_id', label: 'Chat ID', placeholder: '-100xxxxx' }
        ],
        secret_label: 'Bot Token'
    },
    {
        slug: 'slack',
        name: 'Slack',
        description: 'Post messages to a Slack channel via Webhook.',
        icon: MessageSquare,
        category: 'communication',
        fields: [
            { key: 'channel', label: 'Channel Name', placeholder: '#general' }
        ],
        secret_label: 'Webhook URL'
    },
    {
        slug: 'supabase',
        name: 'Supabase',
        description: 'Sync data with external Supabase project.',
        icon: Database,
        category: 'database',
        fields: [
            { key: 'url', label: 'Project URL', placeholder: 'https://xxx.supabase.co' }
        ],
        secret_label: 'Service Role Key'
    },
    {
        slug: 'stripe',
        name: 'Stripe',
        description: 'Process payments and sync invoices.',
        icon: CreditCard,
        category: 'payment',
        fields: [],
        secret_label: 'Secret Key (sk_...)'
    }
];

interface IntegrationDB {
    id: string;
    slug: string;
    name: string;
    is_active: boolean;
    config: any;
    status: string;
    last_synced_at: string;
}

interface SecretDB {
    id: string;
    key: string;
}

export default function IntegrationsPage() {
    const [installed, setInstalled] = useState<Record<string, IntegrationDB>>({});
    const [secrets, setSecrets] = useState<SecretDB[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedService, setSelectedService] = useState<typeof AVAILABLE_SERVICES[0] | null>(null);
    const [configForm, setConfigForm] = useState<any>({});
    const [secretId, setSecretId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const supabase = createClient();

            // Fetch Installed Integrations
            const { data: integrations } = await supabase.from('integrations').select('*');
            if (integrations) {
                const map: Record<string, IntegrationDB> = {};
                integrations.forEach(i => map[i.slug] = i);
                setInstalled(map);
            }

            // Fetch Secrets for dropdown
            const { data: secreteKeys } = await supabase.from('system_secrets').select('id, key');
            if (secreteKeys) setSecrets(secreteKeys);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        try {
            const supabase = createClient();

            // Check if already exists (update) or new (insert)
            const existing = installed[selectedService.slug];

            if (existing) {
                await supabase.from('integrations').update({
                    config: configForm,
                    secret_id: secretId || null,
                    is_active: true,
                    status: 'connected'
                }).eq('id', existing.id);
            } else {
                await supabase.from('integrations').insert({
                    name: selectedService.name,
                    slug: selectedService.slug,
                    config: configForm,
                    secret_id: secretId || null,
                    is_active: true,
                    status: 'connected'
                });
            }

            setSelectedService(null);
            fetchData();
        } catch (error) {
            console.error('Connection failed:', error);
            alert('Failed to save integration.');
        }
    };

    const toggleIntegration = async (slug: string, currentStatus: boolean) => {
        const item = installed[slug];
        if (!item) return;

        const supabase = createClient();
        await supabase.from('integrations').update({
            is_active: !currentStatus,
            status: !currentStatus ? 'connected' : 'disconnected'
        }).eq('id', item.id);

        fetchData();
    };

    const openConnectModal = (service: typeof AVAILABLE_SERVICES[0]) => {
        const existing = installed[service.slug];
        if (existing) {
            setConfigForm(existing.config || {});
            // We don't fetch the secret_id back typically for security, or we could if we select('secret_id')
            // For now simplified
        } else {
            setConfigForm({});
            setSecretId('');
        }
        setSelectedService(service);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Integrations Hub</h1>
                <p className="text-muted-foreground mt-2">Connect external services to Shavi OS</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {AVAILABLE_SERVICES.map((service) => {
                    const isInstalled = !!installed[service.slug];
                    const data = installed[service.slug];
                    const Icon = service.icon;

                    return (
                        <div
                            key={service.slug}
                            className={`relative group bg-white dark:bg-gray-800 rounded-xl border-2 transition-all p-6 flex flex-col ${isInstalled && data.is_active
                                    ? 'border-primary/20 shadow-lg shadow-primary/5'
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                </div>
                                {isInstalled && data.is_active && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                        Active
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
                                {service.description}
                            </p>

                            <div className="flex items-center gap-3 mt-auto">
                                {isInstalled ? (
                                    <>
                                        <button
                                            onClick={() => toggleIntegration(service.slug, data.is_active)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${data.is_active
                                                    ? 'border-red-100 text-red-600 hover:bg-red-50'
                                                    : 'border-green-100 text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {data.is_active ? 'Disconnect' : 'Reconnect'}
                                        </button>
                                        <button
                                            onClick={() => openConnectModal(service)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => openConnectModal(service)}
                                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Connection Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Configure {selectedService.name}
                            </h3>
                            <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConnect} className="space-y-4">
                            {selectedService.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium mb-1">{field.label}</label>
                                    <input
                                        required
                                        type="text"
                                        value={configForm[field.key] || ''}
                                        onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium mb-1 flex justify-between">
                                    <span>{selectedService.secret_label}</span>
                                    <Link href="/tech-panel/secrets" className="text-xs text-primary hover:underline">
                                        Manage Secrets
                                    </Link>
                                </label>
                                <select
                                    required
                                    value={secretId}
                                    onChange={e => setSecretId(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">-- Select a Secret --</option>
                                    {secrets.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.key}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select the API Key/Token stored in Secrets Manager.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedService(null)}
                                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                                >
                                    Save Connection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
