"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Bell,
    Send,
    Smartphone,
    Mail,
    Save,
    CheckCircle,
    AlertCircle,
    Copy,
    MessageSquare,
    Globe
} from 'lucide-react';

interface NotificationChannel {
    id: string;
    channel: 'telegram' | 'whatsapp' | 'email' | string; // Allow generic string to match DB text type
    name: string;
    config: any;
    is_active: boolean | null;
    events: string[] | null;
}

export default function NotificationsPage() {
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('marketing_notifications')
                .select('*')
                .order('created_at');

            if (data) setChannels(data);
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const supabase = createClient();
        await supabase.from('marketing_notifications').update({ is_active: !currentStatus }).eq('id', id);
        fetchChannels();
    };

    const handleSaveConfig = async (id: string, newConfig: any) => {
        setSaving(id);
        try {
            const supabase = createClient();
            await supabase.from('marketing_notifications').update({ config: newConfig }).eq('id', id);
        } catch (error) {
            console.error('Error saving config:', error);
        } finally {
            setSaving(null);
            fetchChannels();
        }
    };

    const getIcon = (channel: string) => {
        switch (channel) {
            case 'telegram': return Send;
            case 'whatsapp': return Smartphone;
            case 'email': return Mail;
            default: return Bell;
        }
    };

    const getColor = (channel: string) => {
        switch (channel) {
            case 'telegram': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'whatsapp': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            case 'email': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">إشعارات التسويق</h1>
                <p className="text-muted-foreground mt-2">إعداد قنوات التنبيه التلقائي للحملات والعملاء</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {channels.map(channel => {
                        const Icon = getIcon(channel.channel);
                        const colorClass = getColor(channel.channel);

                        return (
                            <div key={channel.id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all p-6 ${channel.is_active ? 'border-primary/50 shadow-md' : 'border-gray-200 dark:border-gray-700 opacity-80'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${colorClass}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{channel.channel}</h3>
                                            <p className="text-sm text-gray-500">{channel.name}</p>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={!!channel.is_active}
                                            onChange={() => handleToggle(channel.id, !!channel.is_active)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {/* Configuration Form */}
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Globe className="w-4 h-4" />
                                        إعدادات الاتصال
                                    </h4>

                                    {channel.channel === 'telegram' && (
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500">Bot Token</label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                                    className="w-full text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-orange-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    تم إعداد الـ Token في أسرار النظام
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500">Chat ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="-100xxxxxxx"
                                                    defaultValue={channel.config?.chat_id || ''}
                                                    onBlur={(e) => handleSaveConfig(channel.id, { ...channel.config, chat_id: e.target.value })}
                                                    className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {channel.channel === 'email' && (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500">Recipient Email</label>
                                            <input
                                                type="email"
                                                placeholder="marketing@shavi.os"
                                                defaultValue={channel.config?.email || ''}
                                                onBlur={(e) => handleSaveConfig(channel.id, { ...channel.config, email: e.target.value })}
                                                className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 outline-none focus:border-primary"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                                            {saving === channel.id ? (
                                                <span className="animate-pulse">جاري الحفظ...</span>
                                            ) : (
                                                <>
                                                    <Save className="w-3 h-3" />
                                                    حفظ التغييرات
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
