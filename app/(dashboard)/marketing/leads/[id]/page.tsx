"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    Edit2,
    Save,
    X,
    Clock,
    MessageSquare,
    PhoneCall,
    Video
} from 'lucide-react';

interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    source: string;
    created_at: string;
    total_score?: number;
    temperature?: 'hot' | 'warm' | 'cold';
    notes?: string;
    last_contact?: string;
}

interface Activity {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    description: string;
    created_at: string;
    created_by?: string;
}

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const leadId = params.id as string;

    const [lead, setLead] = useState<Lead | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

    useEffect(() => {
        if (leadId) {
            fetchLead();
            fetchActivities();
        }
    }, [leadId]);

    async function fetchLead() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .single();

            if (error) throw error;
            setLead(data);
            setEditedLead(data);
        } catch (error) {
            console.error('Error fetching lead:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchActivities() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('lead_activities')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });

            if (error) {
                console.log('Activities table not available');
                return;
            }
            setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }

    const [newActivity, setNewActivity] = useState({ type: 'note', description: '' });
    const [submittingActivity, setSubmittingActivity] = useState(false);

    async function handleAddActivity(e: React.FormEvent) {
        e.preventDefault();
        setSubmittingActivity(true);

        try {
            const response = await fetch(`/api/marketing/leads/${leadId}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity),
            });

            if (!response.ok) throw new Error('Failed to add activity');

            const activity = await response.json();
            setActivities([activity, ...activities]);
            setNewActivity({ type: 'note', description: '' });

            // Update last contact locally
            if (lead) {
                setLead({ ...lead, last_contact: new Date().toISOString() });
            }
        } catch (error) {
            console.error('Error adding activity:', error);
            alert('فشل في إضافة النشاط');
        } finally {
            setSubmittingActivity(false);
        }
    }

    async function handleSave() {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('leads')
                .update(editedLead)
                .eq('id', leadId);

            if (error) throw error;

            setLead({ ...lead!, ...editedLead });
            setEditing(false);
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('فشل في حفظ التغييرات');
        }
    }

    const getTemperatureConfig = (temp?: 'hot' | 'warm' | 'cold') => {
        if (temp === 'hot') return {
            icon: TrendingUp,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/10',
            label: 'ساخن 🔥'
        };
        if (temp === 'warm') return {
            icon: Minus,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/10',
            label: 'دافئ 🟡'
        };
        if (temp === 'cold') return {
            icon: TrendingDown,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/10',
            label: 'بارد 🔵'
        };
        return {
            icon: Minus,
            color: 'text-gray-500',
            bg: 'bg-gray-50 dark:bg-gray-900/10',
            label: 'غير محدد'
        };
    };

    const getStatusColor = (status: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            qualified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            converted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            lost: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return colors[status as keyof typeof colors] || colors.new;
    };

    const getActivityIcon = (type: string) => {
        const icons = {
            call: PhoneCall,
            email: Mail,
            meeting: Video,
            note: MessageSquare,
        };
        return icons[type as keyof typeof icons] || MessageSquare;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        العميل المحتمل غير موجود
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-primary hover:underline"
                    >
                        العودة إلى القائمة
                    </button>
                </div>
            </div>
        );
    }

    const tempConfig = getTemperatureConfig(lead.temperature);
    const TempIcon = tempConfig.icon;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {lead.first_name} {lead.last_name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {lead.company || 'لا توجد شركة'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {editing ? (
                        <>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setEditedLead(lead);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                حفظ
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            تعديل
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">معلومات الاتصال</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                {editing ? (
                                    <input
                                        type="email"
                                        value={editedLead.email || ''}
                                        onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                ) : (
                                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                        {lead.email}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={editedLead.phone || ''}
                                        onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                ) : (
                                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                        {lead.phone || 'غير متوفر'}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                {editing ? (
                                    <input
                                        type="text"
                                        value={editedLead.company || ''}
                                        onChange={(e) => setEditedLead({ ...editedLead, company: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                ) : (
                                    <span>{lead.company || 'غير متوفر'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    تم الإنشاء: {new Date(lead.created_at).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">ملاحظات</h2>
                        {editing ? (
                            <textarea
                                value={editedLead.notes || ''}
                                onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                                placeholder="أضف ملاحظات هنا..."
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {lead.notes || 'لا توجد ملاحظات'}
                            </p>
                        )}
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">الأنشطة</h2>

                        {/* Add Activity Form */}
                        <form onSubmit={handleAddActivity} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold mb-3">تسجيل نشاط جديد</h3>
                            <div className="flex gap-4 mb-3">
                                <div className="flex-1">
                                    <select
                                        value={newActivity.type}
                                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                    >
                                        <option value="note">ملاحظة</option>
                                        <option value="call">مكالمة</option>
                                        <option value="email">بريد إلكتروني</option>
                                        <option value="meeting">اجتماع</option>
                                    </select>
                                </div>
                                <div className="flex-[3]">
                                    <input
                                        type="text"
                                        placeholder="تفاصيل النشاط..."
                                        value={newActivity.description}
                                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingActivity}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
                                >
                                    {submittingActivity ? 'جاري الإضافة...' : 'إضافة'}
                                </button>
                            </div>
                        </form>

                        {activities.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">لا توجد أنشطة بعد</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => {
                                    const ActivityIcon = getActivityIcon(activity.type);
                                    return (
                                        <div key={activity.id} className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <ActivityIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(activity.created_at).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Score Card */}
                    <div className={`${tempConfig.bg} rounded-lg border border-gray-200 dark:border-gray-700 p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">درجة العميل</h3>
                            <TempIcon className={`w-6 h-6 ${tempConfig.color}`} />
                        </div>
                        <div className="text-4xl font-bold mb-2">
                            {lead.total_score || 0}
                        </div>
                        <p className={`text-sm ${tempConfig.color} font-medium`}>
                            {tempConfig.label}
                        </p>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold mb-4">الحالة</h3>
                        {editing ? (
                            <select
                                value={editedLead.status || lead.status}
                                onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value as any })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <option value="new">جديد</option>
                                <option value="contacted">تم التواصل</option>
                                <option value="qualified">مؤهل</option>
                                <option value="converted">محول</option>
                                <option value="lost">مفقود</option>
                            </select>
                        ) : (
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(lead.status)}`}>
                                {lead.status === 'new' && 'جديد'}
                                {lead.status === 'contacted' && 'تم التواصل'}
                                {lead.status === 'qualified' && 'مؤهل'}
                                {lead.status === 'converted' && 'محول'}
                                {lead.status === 'lost' && 'مفقود'}
                            </span>
                        )}
                    </div>

                    {/* Source Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold mb-2">المصدر</h3>
                        <p className="text-gray-600 dark:text-gray-400">{lead.source}</p>
                    </div>

                    {/* Last Contact */}
                    {lead.last_contact && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <h3 className="font-bold">آخر تواصل</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(lead.last_contact).toLocaleString('ar-EG')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
