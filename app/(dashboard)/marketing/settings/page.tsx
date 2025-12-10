"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Facebook,
    Instagram,
    Linkedin,
    Search,
    Video,
    Key,
    CheckCircle,
    XCircle,
    Save,
    Eye
} from 'lucide-react';

interface Integration {
    id: string;
    service: string;
    client_id: string;
    is_active: boolean;
}

const INTEGRATIONS = [
    { key: 'meta_ads', name: 'Meta Ads Manager', icon: Facebook, color: 'text-blue-600 bg-blue-50' },
    { key: 'google_ads', name: 'Google Ads', icon: Search, color: 'text-red-500 bg-red-50' },
    { key: 'tiktok_ads', name: 'TikTok for Business', icon: Video, color: 'text-black bg-gray-100 dark:text-white dark:bg-gray-800' },
    { key: 'linkedin_ads', name: 'LinkedIn Campaign Manager', icon: Linkedin, color: 'text-blue-700 bg-blue-50' },
    { key: 'microsoft_clarity', name: 'Microsoft Clarity', icon: Eye, color: 'text-orange-600 bg-orange-50' },
];

export default function MarketingSettingsPage() {
    const [credentials, setCredentials] = useState<Record<string, Integration>>({});
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ client_id: '', client_secret: '' });

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('integration_credentials').select('*');
        if (data) {
            const map: Record<string, Integration> = {};
            data.forEach((item: any) => map[item.service] = item);
            setCredentials(map);
        }
        setLoading(false);
    };

    const handleEdit = (key: string) => {
        setEditing(key);
        setFormData({
            client_id: credentials[key]?.client_id || '',
            client_secret: '' // Don't show secret
        });
    };

    const handleSave = async (key: string) => {
        const supabase = createClient();

        // Upsert
        const { error } = await supabase.from('integration_credentials').upsert({
            service: key,
            client_id: formData.client_id,
            client_secret: formData.client_secret, // In real app, encrypt this!
            is_active: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'service' });

        if (!error) {
            setEditing(null);
            fetchCredentials();
        } else {
            alert('Failed to save credentials');
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">إعدادات التكامل</h1>
                <p className="text-muted-foreground mt-2">ربط منصات الإعلانات وأدوات التحليل</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {INTEGRATIONS.map(integ => {
                    const cred = credentials[integ.key];
                    const isActive = cred?.is_active;
                    const isEditing = editing === integ.key;
                    const Icon = integ.icon;

                    return (
                        <div key={integ.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${integ.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{integ.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isActive ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle className="w-3 h-3" /> متصل
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <XCircle className="w-3 h-3" /> غير متصل
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(integ.key)}
                                    className="p-2 text-primary hover:bg-primary/5 rounded-lg text-sm font-medium"
                                >
                                    {isActive ? 'تعديل' : 'ربط'}
                                </button>
                            </div>

                            {isEditing && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500">App ID / Client ID</label>
                                        <div className="relative">
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full pr-10 pl-4 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-primary"
                                                value={formData.client_id}
                                                onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                                placeholder={`Enter ${integ.name} Client ID`}
                                            />
                                        </div>
                                    </div>
                                    {integ.key !== 'microsoft_clarity' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500">App Secret</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-primary"
                                                value={formData.client_secret}
                                                onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                                                placeholder="••••••••••••••"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => setEditing(null)}
                                            className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={() => handleSave(integ.key)}
                                            className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"
                                        >
                                            <Save className="w-3 h-3" />
                                            حفظ وربط
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isEditing && isActive && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Last synced: {new Date().toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
