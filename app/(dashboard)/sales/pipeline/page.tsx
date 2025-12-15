"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { TrendingUp, Flame, Phone, Mail, MessageSquare, RefreshCcw, Filter, Search } from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    customer_name: string | null;
    value: number | null;
    stage: string;
    priority?: 'hot' | 'warm' | 'cold' | string | null; // Broadened to string | null for safety
    created_at: string;
}

const stages = [
    { id: 'lead', name: 'عميل محتمل', nameEn: 'Lead', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300' },
    { id: 'contacted', name: 'تم التواصل', nameEn: 'Contacted', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' },
    { id: 'proposal', name: 'عرض سعر', nameEn: 'Proposal', color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' },
    { id: 'negotiation', name: 'تفاوض', nameEn: 'Negotiation', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300' },
    { id: 'closed_won', name: 'نجاح', nameEn: 'Won', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' },
    { id: 'closed_lost', name: 'خسارة', nameEn: 'Lost', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' }
];

export default function SalesPipelinePage() {
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Unable to fetch deals:', error.message || 'Table may be empty');
                setDeals([]);
            } else {
                setDeals(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch deals:', err);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const deal = deals.find(d => d.id === event.active.id);
        setActiveDeal(deal || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const dealId = active.id as string;
            const newStage = over.id as string;

            // Optimistic update
            setDeals(deals =>
                deals.map(deal =>
                    deal.id === dealId ? { ...deal, stage: newStage } : deal
                )
            );

            // Update database
            try {
                const supabase = createClient();
                const { error } = await supabase
                    .from('deals')
                    .update({ stage: newStage, updated_at: new Date().toISOString() })
                    .eq('id', dealId);

                if (error) {
                    console.error('Error updating deal:', error);
                    // Revert on error
                    fetchDeals();
                }
            } catch (err) {
                console.error('Failed to update deal:', err);
                fetchDeals();
            }
        }

        setActiveDeal(null);
    };

    const getDealsByStage = (stageId: string) => {
        return deals.filter(deal => {
            const matchesStage = deal.stage === stageId;
            const matchesSearch = !searchTerm ||
                deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = filterPriority === 'all' || deal.priority === filterPriority;

            return matchesStage && matchesSearch && matchesPriority;
        });
    };

    const getTotalValue = (stageId: string) => {
        return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
    };

    const totalPipelineValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل خط الأنابيب...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            خط أنابيب المبيعات
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">اسحب الصفقات بين المراحل لتحديث الحالة</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-black text-green-600 dark:text-green-400">
                                {totalPipelineValue.toLocaleString('ar-EG')} جنيه
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي القيمة</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{deals.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">صفقات نشطة</div>
                        </div>
                        <button
                            onClick={fetchDeals}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            تحديث
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث في الصفقات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="all">كل الأولويات</option>
                        <option value="hot">ساخنة</option>
                        <option value="warm">دافئة</option>
                        <option value="cold">باردة</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto p-4">
                    <div className="flex gap-4 h-full min-w-max">
                        {stages.map(stage => {
                            const stageDeals = getDealsByStage(stage.id);
                            const totalValue = getTotalValue(stage.id);

                            return (
                                <KanbanColumn
                                    key={stage.id}
                                    stage={stage}
                                    deals={stageDeals}
                                    totalValue={totalValue}
                                />
                            );
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {activeDeal ? <DealCardPreview deal={activeDeal} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function KanbanColumn({ stage, deals, totalValue }: { stage: any; deals: Deal[]; totalValue: number }) {
    const { useDroppable } = require('@dnd-kit/core');
    const { setNodeRef } = useDroppable({ id: stage.id });

    return (
        <div
            ref={setNodeRef}
            className="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full"
        >
            {/* Column Header */}
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${stage.color} rounded-t-xl`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm uppercase">{stage.name}</h3>
                    <span className="text-xs font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">{deals.length}</span>
                </div>
                <div className="text-xs font-medium opacity-80">
                    {totalValue.toLocaleString('ar-EG')} جنيه
                </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
                {deals.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 text-xs py-8">
                        اسحب الصفقات هنا
                    </div>
                )}
            </div>
        </div>
    );
}

function DealCard({ deal }: { deal: Deal }) {
    const { useDraggable } = require('@dnd-kit/core');
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    const getPriorityColor = (priority?: string | null) => {
        if (priority === 'hot') return 'border-r-4 border-red-500 bg-red-50/30 dark:bg-red-900/10';
        if (priority === 'warm') return 'border-r-4 border-orange-500 bg-orange-50/30 dark:bg-orange-900/10';
        if (priority === 'cold') return 'border-r-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10';
        return 'border-r-4 border-gray-300 dark:border-gray-600';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${getPriorityColor(deal.priority)}`}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex-1">{deal.title}</h4>
                {deal.priority === 'hot' && <Flame className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{deal.customer_name}</p>

            <div className="flex items-center justify-between">
                <div className="text-lg font-black text-green-600 dark:text-green-400">
                    {((deal.value || 0) / 1000).toFixed(0)}K
                </div>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <Phone className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <Mail className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <MessageSquare className="w-3 h-3 text-gray-400" />
                    </button>
                </div>
            </div>


        </div>
    );
}

function DealCardPreview({ deal }: { deal: Deal }) {
    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-primary shadow-2xl w-80 opacity-90">
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{deal.title}</h4>
                {deal.priority === 'hot' && <Flame className="w-4 h-4 text-red-500 fill-red-500" />}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{deal.customer_name}</p>
            <div className="text-lg font-black text-green-600 dark:text-green-400">
                {((deal.value || 0) / 1000).toFixed(0)}K جنيه
            </div>
        </div>
    );
}
