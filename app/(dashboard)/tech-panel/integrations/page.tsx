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
    CreditCard,
    AlertCircle,
    Clock
} from 'lucide-react';
import Link from 'next/link';

// Supported Services definitions
const AVAILABLE_SERVICES = [
    {
        slug: 'telegram',
        name: 'Telegram',
        nameAr: 'تيليجرام',
        description: 'Send notifications to a Telegram Channel or Group.',
        descriptionAr: 'إرسال إشعارات إلى قناة أو مجموعة تيليجرام',
        icon: MessageSquare,
        category: 'communication',
        fields: [
            { key: 'chat_id', label: 'Chat ID', labelAr: 'معرف المحادثة', placeholder: '-100xxxxx' }
        ],
        secret_label: 'Bot Token',
        secret_label_ar: 'رمز البوت'
    },
    {
        slug: 'slack',
        name: 'Slack',
        nameAr: 'سلاك',
        description: 'Post messages to a Slack channel via Webhook.',
        descriptionAr: 'نشر رسائل إلى قناة سلاك عبر Webhook',
        icon: MessageSquare,
        category: 'communication',
        fields: [
            { key: 'channel', label: 'Channel Name', labelAr: 'اسم القناة', placeholder: '#general' }
        ],
        secret_label: 'Webhook URL',
        secret_label_ar: 'رابط Webhook'
    },
    {
        slug: 'supabase',
        name: 'Supabase',
        nameAr: 'سوبابيس',
        description: 'Sync data with external Supabase project.',
        descriptionAr: 'مزامنة البيانات مع مشروع سوبابيس خارجي',
        icon: Database,
        category: 'database',
        fields: [
            { key: 'url', label: 'Project URL', labelAr: 'رابط المشروع', placeholder: 'https://xxx.supabase.co' }
        ],
        secret_label: 'Service Role Key',
        secret_label_ar: 'مفتاح الخدمة'
    },
    {
        slug: 'stripe',
        name: 'Stripe',
        nameAr: 'سترايب',
        description: 'Process payments and sync invoices.',
        descriptionAr: 'معالجة المدفوعات ومزامنة الفواتير',
        icon: CreditCard,
        category: 'payment',
        fields: [],
        secret_label: 'Secret Key (sk_...)',
        secret_label_ar: 'المفتاح السري'
    }
];

interface IntegrationDB {
    id: string;
    slug: string;
    name: string;
    is_active: boolean | null;
    config: any;
    status: string | null;
    last_synced_at: string | null;
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
    const [saving, setSaving] = useState(false);

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
            const { data: secretKeys } = await supabase.from('system_secrets').select('id, key');
            if (secretKeys) setSecrets(secretKeys);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        setSaving(true);
        try {
            const supabase = createClient();

            // Check if already exists (update) or new (insert)
            const existing = installed[selectedService.slug];

            if (existing) {
                await supabase.from('integrations').update({
                    config: configForm,
                    secret_id: secretId || null,
                    is_active: true,
                    status: 'connected',
                    last_synced_at: new Date().toISOString()
                }).eq('id', existing.id);
            } else {
                await supabase.from('integrations').insert({
                    name: selectedService.name,
                    slug: selectedService.slug,
                    config: configForm,
                    secret_id: secretId || null,
                    is_active: true,
                    status: 'connected',
                    last_synced_at: new Date().toISOString()
                });
            }

            setSelectedService(null);
            fetchData();
        } catch (error) {
            console.error('Connection failed:', error);
            alert('فشل حفظ التكامل');
        } finally {
            setSaving(false);
        }
    };

    const toggleIntegration = async (slug: string, currentStatus: boolean | null) => {
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
        } else {
            setConfigForm({});
            setSecretId('');
        }
        setSelectedService(service);
    };

    const activeCount = Object.values(installed).filter(i => i.is_active).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التكاملات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-8 h-8 text-primary" />
                        مركز التكاملات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">ربط الخدمات الخارجية بنظام Shavi OS</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{activeCount}</div>
                    <div className="text-sm text-gray-500">تكامل نشط</div>
                </div>
            </div>

            {/* Services Grid */}
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
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                </div>
                                {isInstalled && data.is_active && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                        نشط
                                    </span>
                                )}
                                {isInstalled && !data.is_active && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-full">
                                        <AlertCircle className="w-3 h-3" />
                                        معطل
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-1">{service.nameAr}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                                {service.descriptionAr}
                            </p>

                            {isInstalled && data.last_synced_at && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                                    <Clock className="w-3 h-3" />
                                    آخر مزامنة: {new Date(data.last_synced_at).toLocaleDateString('ar-EG')}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mt-auto">
                                {isInstalled ? (
                                    <>
                                        <button
                                            onClick={() => toggleIntegration(service.slug, data.is_active)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${data.is_active
                                                    ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                        >
                                            {data.is_active ? 'قطع الاتصال' : 'إعادة الاتصال'}
                                        </button>
                                        <button
                                            onClick={() => openConnectModal(service)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="الإعدادات"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => openConnectModal(service)}
                                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                                    >
                                        ربط
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
                                إعداد {selectedService.nameAr}
                            </h3>
                            <button
                                onClick={() => setSelectedService(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConnect} className="space-y-4">
                            {selectedService.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                        {field.labelAr}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={configForm[field.key] || ''}
                                        onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium mb-1.5 flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>{selectedService.secret_label_ar}</span>
                                    <Link href="/tech-panel/secrets" className="text-xs text-primary hover:underline">
                                        إدارة الأسرار
                                    </Link>
                                </label>
                                <select
                                    required
                                    value={secretId}
                                    onChange={e => setSecretId(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="">-- اختر سر --</option>
                                    {secrets.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.key}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                    اختر المفتاح/الرمز المخزن في مدير الأسرار
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedService(null)}
                                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        'حفظ الاتصال'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
