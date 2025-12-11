"use client";

import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { TrendingUp, Flame, CheckCircle, XCircle, Phone, Mail, MessageSquare, Clock } from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    company: string;
    value: number;
    stage: string;
    priority: 'hot' | 'warm' | 'cold';
    contact_name: string;
}

const stages = [
    { id: 'new', name: 'New', color: 'bg-gray-100 border-gray-300 text-gray-700' },
    { id: 'contacted', name: 'Contacted', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { id: 'qualified', name: 'Qualified', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { id: 'proposal', name: 'Proposal', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { id: 'closed', name: 'Closed', color: 'bg-green-100 border-green-300 text-green-700' }
];

export default function SalesPipelinePage() {
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [deals, setDeals] = useState<Deal[]>([
        { id: '1', title: 'Enterprise License', company: 'Tech Corp', value: 50000, stage: 'proposal', priority: 'hot', contact_name: 'Ahmed Hassan' },
        { id: '2', title: 'Startup Package', company: 'Startup Inc', value: 15000, stage: 'negotiation', priority: 'warm', contact_name: 'Sara Ali' },
        { id: '3', title: 'Renewal Deal', company: 'Big Co', value: 80000, stage: 'contacted', priority: 'hot', contact_name: 'Mohamed Saeed' },
        { id: '4', title: 'Real Estate', company: 'Property Ltd', value: 25000, stage: 'qualified', priority: 'cold', contact_name: 'Laila Mohamed' },
        { id: '5', title: 'New Inquiry', company: 'Retail Chain', value: 35000, stage: 'new', priority: 'warm', contact_name: 'Omar Khalid' },
        { id: '6', title: 'Expansion Deal', company: 'Tech Corp', value: 120000, stage: 'proposal', priority: 'hot', contact_name: 'Fatima Ali' },
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const deal = deals.find(d => d.id === event.active.id);
        setActiveDeal(deal || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const dealId = active.id as string;
            const newStage = over.id as string;

            setDeals(deals =>
                deals.map(deal =>
                    deal.id === dealId ? { ...deal, stage: newStage } : deal
                )
            );
        }

        setActiveDeal(null);
    };

    const getDealsByStage = (stageId: string) => {
        return deals.filter(deal => deal.stage === stageId);
    };

    const getTotalValue = (stageId: string) => {
        return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            Sales Pipeline
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Drag deals between stages to update status</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-black text-green-600">${deals.reduce((sum, d) => sum + d.value, 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total Pipeline</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{deals.length}</div>
                            <div className="text-xs text-gray-500">Active Deals</div>
                        </div>
                    </div>
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
                    <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{deals.length}</span>
                </div>
                <div className="text-xs font-medium opacity-80">
                    ${totalValue.toLocaleString()}
                </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
                {deals.length === 0 && (
                    <div className="text-center text-gray-400 text-xs py-8">
                        Drop deals here
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

    const getPriorityColor = (priority: string) => {
        if (priority === 'hot') return 'border-l-4 border-red-500 bg-red-50/30 dark:bg-red-900/10';
        if (priority === 'warm') return 'border-l-4 border-orange-500 bg-orange-50/30 dark:bg-orange-900/10';
        return 'border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10';
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

            <p className="text-xs text-gray-500 mb-3">{deal.company}</p>

            <div className="flex items-center justify-between">
                <div className="text-lg font-black text-green-600">${(deal.value / 1000).toFixed(0)}K</div>
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

            <div className="text-[10px] text-gray-400 mt-2">{deal.contact_name}</div>
        </div>
    );
}

function DealCardPreview({ deal }: { deal: Deal }) {
    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-primary shadow-2xl w-80 opacity-90">
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-sm">{deal.title}</h4>
                {deal.priority === 'hot' && <Flame className="w-4 h-4 text-red-500 fill-red-500" />}
            </div>
            <p className="text-xs text-gray-500 mb-2">{deal.company}</p>
            <div className="text-lg font-black text-green-600">${(deal.value / 1000).toFixed(0)}K</div>
        </div>
    );
}
