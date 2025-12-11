"use client";

import { useState } from 'react';
import {
    Layout,
    Users,
    MoreHorizontal,
    MoveRight,
    AlertCircle,
    Check,
    CheckCircle
} from 'lucide-react';

interface Ticket {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Agent {
    id: string;
    name: string;
    status: 'online' | 'busy' | 'offline';
    capacity: number; // Max tickets
    load: number;     // Current tickets
    tickets: Ticket[];
}

export default function WorkloadBalancerPage() {
    // Mock Data
    const [agents, setAgents] = useState<Agent[]>([
        {
            id: '1', name: 'Sarah Ahmed', status: 'online', capacity: 10, load: 8,
            tickets: [
                { id: '101', title: 'Login Issue', priority: 'high' },
                { id: '102', title: 'Refund Request', priority: 'medium' },
                { id: '103', title: 'Course Missing', priority: 'medium' },
            ]
        },
        {
            id: '2', name: 'Mohamed Ali', status: 'busy', capacity: 10, load: 3,
            tickets: [
                { id: '104', title: 'Certificate Error', priority: 'low' }
            ]
        },
        {
            id: '3', name: 'Laila Khan', status: 'offline', capacity: 8, load: 0,
            tickets: []
        },
    ]);

    const [unassigned, setUnassigned] = useState<Ticket[]>([
        { id: '201', title: 'Urgent: Payment Failed', priority: 'urgent' },
        { id: '202', title: 'Cannot access quiz', priority: 'high' },
    ]);

    const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
    const [sourceContainer, setSourceContainer] = useState<string | null>(null);

    const handleDragStart = (ticket: Ticket, source: string) => {
        setDraggedTicket(ticket);
        setSourceContainer(source);
    };

    const handleDrop = (targetAgentId: string) => {
        if (!draggedTicket) return;

        // If dropped on same agent, do nothing
        if (sourceContainer === targetAgentId) return;

        // Visual simulation of logic
        // 1. Remove from source
        if (sourceContainer === 'unassigned') {
            setUnassigned(prev => prev.filter(t => t.id !== draggedTicket.id));
        } else {
            setAgents(prev => prev.map(a => {
                if (a.id === sourceContainer) {
                    return { ...a, tickets: a.tickets.filter(t => t.id !== draggedTicket.id), load: a.load - 1 };
                }
                return a;
            }));
        }

        // 2. Add to target
        setAgents(prev => prev.map(a => {
            if (a.id === targetAgentId) {
                return { ...a, tickets: [...a.tickets, draggedTicket], load: a.load + 1 };
            }
            return a;
        }));

        setDraggedTicket(null);
        setSourceContainer(null);
    };

    const getLoadColor = (load: number, capacity: number) => {
        const ratio = load / capacity;
        if (ratio > 0.8) return 'bg-red-100 text-red-600 border-red-200';
        if (ratio > 0.5) return 'bg-orange-100 text-orange-600 border-orange-200';
        return 'bg-green-100 text-green-600 border-green-200';
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout className="w-6 h-6 text-primary" />
                        Workload Balancer
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Drag and drop tickets to redistribute workload efficiently.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Auto-Balance Team
                    </button>
                </div>
            </div>

            {/* Unassigned Pool */}
            <div className="mb-8 shrink-0">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Unassigned Tickets (Needs Distribution)
                </h3>
                <div
                    className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 min-h-[100px] flex gap-4 overflow-x-auto"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { /* Logic to drop back to unassigned if needed */ }}
                >
                    {unassigned.length === 0 ? (
                        <div className="text-gray-400 text-sm flex items-center gap-2 m-auto">
                            <Check className="w-4 h-4" /> All tickets assigned!
                        </div>
                    ) : (
                        unassigned.map(ticket => (
                            <div
                                key={ticket.id}
                                draggable
                                onDragStart={() => handleDragStart(ticket, 'unassigned')}
                                className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-3 rounded-lg w-64 shrink-0 cursor-move hover:shadow-md hover:border-primary transition-all"
                            >
                                <div className={`text-[10px] font-bold uppercase mb-1 ${ticket.priority === 'urgent' ? 'text-red-500' : 'text-blue-500'}`}>{ticket.priority}</div>
                                <p className="font-bold text-sm truncate">{ticket.title}</p>
                                <p className="text-xs text-gray-400">#{ticket.id}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-6">
                {agents.map(agent => (
                    <div
                        key={agent.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(agent.id)}
                        className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors flex flex-col ${draggedTicket && agent.load < agent.capacity ? 'border-primary border-dashed bg-primary/5' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {/* Agent Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                        {agent.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${agent.status === 'online' ? 'bg-green-500' :
                                        agent.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                                        }`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{agent.name}</h3>
                                    <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>

                        {/* Load Indicator */}
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between text-xs font-bold text-gray-500">
                            <span>Workload</span>
                            <span className={`${agent.load > agent.capacity ? 'text-red-500' : 'text-gray-700'}`}>
                                {agent.load} / {agent.capacity} Tickets
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100">
                            <div
                                className={`h-full transition-all duration-500 ${agent.load / agent.capacity > 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${(agent.load / agent.capacity) * 100}%` }}
                            ></div>
                        </div>

                        {/* Ticket List */}
                        <div className="p-4 space-y-3 flex-1 min-h-[200px]">
                            {agent.tickets.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 mb-2 opacity-50" />
                                    No Active Tickets
                                </div>
                            ) : (
                                agent.tickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        draggable
                                        onDragStart={() => handleDragStart(ticket, agent.id)}
                                        className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-move hover:border-blue-400 group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${ticket.priority === 'high' ? 'text-orange-500' : 'text-gray-500'}`}>{ticket.priority}</span>
                                            <MoveRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ticket.title}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
