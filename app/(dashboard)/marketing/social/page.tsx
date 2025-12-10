"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Plus,
    BarChart2,
    ExternalLink,
    CheckCircle,
    XCircle,
    ThumbsUp,
    MessageCircle,
    Share2
} from 'lucide-react';
import Image from 'next/image';

interface SocialAccount {
    id: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
    username: string;
    page_name: string;
    is_connected: boolean;
    avatar_url?: string;
}

interface SocialPost {
    id: string;
    content: string;
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    created_at: string;
    status: string;
}

const PLATFORM_ICONS = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter
};

const PLATFORM_COLORS = {
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-tr from-yellow-400 to-purple-600',
    linkedin: 'bg-blue-700',
    twitter: 'bg-sky-500'
};

export default function SocialMediaPage() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSocialData();
    }, []);

    const fetchSocialData = async () => {
        try {
            const supabase = createClient();

            // Fetch Accounts
            const { data: accData } = await supabase.from('social_accounts').select('*');
            if (accData) setAccounts(accData);

            // Fetch Recent Posts (Mock join for demo if needed, valid simplified)
            const { data: postData } = await supabase
                .from('social_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (postData) setPosts(postData);

        } catch (error) {
            console.error('Error fetching social data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleConnection = async (id: string, currentStatus: boolean) => {
        const supabase = createClient();
        await supabase.from('social_accounts').update({ is_connected: !currentStatus }).eq('id', id);
        fetchSocialData();
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">منصات التواصل الاجتماعي</h1>
                    <p className="text-muted-foreground mt-2">إدارة الحسابات وربط المنصات</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>منشور جديد</span>
                </button>
            </div>

            {/* Connected Accounts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {accounts.map(account => {
                    const Icon = PLATFORM_ICONS[account.platform as keyof typeof PLATFORM_ICONS] || Facebook;
                    const colorClass = PLATFORM_COLORS[account.platform as keyof typeof PLATFORM_COLORS] || 'bg-gray-500';

                    return (
                        <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                {account.is_connected ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-gray-300" />
                                )}
                            </div>

                            <div className={`p-4 rounded-full mb-4 ${colorClass} text-white shadow-lg`}>
                                <Icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{account.page_name || account.username}</h3>
                            <p className="text-sm text-gray-500 mb-6">@{account.username}</p>

                            <button
                                onClick={() => toggleConnection(account.id, account.is_connected)}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors border ${account.is_connected
                                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                        : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                            >
                                {account.is_connected ? 'إعدادات الربط' : 'ربط الحساب'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Recent Posts Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        أحدث المنشورات
                    </h3>
                    <button className="text-sm text-primary hover:underline">عرض الكل ({posts.length})</button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {posts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد منشورات حديثة لعرضها.
                        </div>
                    ) : (
                        posts.map(post => {
                            const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || Facebook;

                            return (
                                <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex gap-4">
                                    <div className="shrink-0 pt-1">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 dark:text-gray-100 font-medium line-clamp-2 mb-3">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <ThumbsUp className="w-4 h-4" /> {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MessageCircle className="w-4 h-4" /> {post.comments}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Share2 className="w-4 h-4" /> {post.shares}
                                            </span>
                                            <span className="ml-auto text-xs">
                                                {new Date(post.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
