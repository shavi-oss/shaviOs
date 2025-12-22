"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent, UniqueIdentifier, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTickets, updateTicket } from '@/app/actions/tickets';
import { StatusDropdown } from './status-dropdown';
import NewTicketModal from './new-ticket-modal';
import {
    Filter,
    LayoutGrid,
    List as ListIcon,
    Search,
    Clock,
    User,
    MoreHorizontal,
    GripVertical,
    Zap,
    Calendar,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    title: string;
    status: string;
    priority: string;
    customer_name: string;
    created_at: string;
    tags: string[];
}

type Column = 'open' | 'in_progress' | 'resolved';

const COLUMNS: { id: Column; title: string; color: string; bgColor: string; borderColor: string }[] = [
    { id: 'open', title: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-600' },
    { id: 'in_progress', title: 'In Progress', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-600' },
    { id: 'resolved', title: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-600' },
];

function KanbanTicketCard({ ticket }: { ticket: Ticket }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ticket.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'urgent') return <Zap className="w-4 h-4 text-red-500 fill-red-500" />;
        if (priority === 'high') return <Zap className="w-4 h-4 text-orange-500" />;
        if (priority === 'medium') return <Clock className="w-4 h-4 text-yellow-500" />;
        return <Clock className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                        {ticket.title}
                    </h3>
                </div>
                {getPriorityIcon(ticket.priority || 'low')}
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                {ticket.customer_name && (
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.customer_name}
                    </div>
                )}
                {ticket.created_at && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.created_at).toLocaleDateString('ar-EG')}
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                    {ticket.priority || 'low'}
                </span>
            </div>
        </div>
    );
}

function DroppableColumn({ 
    column, 
    tickets 
}: { 
    column: typeof COLUMNS[0]; 
    tickets: Ticket[];
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            status: column.id
        }
    });

    return (
        <div className="flex-1 min-w-[300px]">
            <div className={`${column.bgColor} rounded-t-xl p-4 border-b-4 ${column.borderColor}`}>
                <div className="flex items-center justify-between">
                    <h2 className={`font-bold text-lg ${column.color}`}>
                        {column.title}
                    </h2>
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-bold">
                        {tickets.length}
                    </span>
                </div>
            </div>
            
            <div 
                ref={setNodeRef}
                className={`bg-gray-50 dark:bg-gray-900/50 rounded-b-xl p-4 min-h-[500px] transition-colors ${
                    isOver ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''
                }`}
            >
                <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {tickets.map(ticket => (
                            <KanbanTicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                </SortableContext>

                {tickets.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لا توجد تذاكر</p>
                        <p className="text-xs mt-2">اسحب تذكرة هنا</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TicketsPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getTickets();
            
            const mappedTickets: Ticket[] = data.map((t) => ({
                id: t.id,
                title: t.title || '',
                status: t.status || 'open',
                priority: t.priority || 'low',
                customer_name: t.student_name || t.student_email || 'Unknown',
                created_at: t.created_at || new Date().toISOString(),
                tags: []
            }));

            setTickets(mappedTickets);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
            toast.error('فشل تحميل التذاكر');
        } finally {
            setLoading(false);
        }
    };

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            console.log('[Kanban] Drop cancelled - no target');
            return;
        }

        const ticketId = active.id as string;
        const overId = over.id as string;
        
        console.log('[Kanban] Drag ended:', { ticketId, overId, overData: over.data.current });

        // Try to get column status from over.data first
        let newStatus: Column | null = null;
        
        if (over.data.current?.type === 'column') {
            newStatus = over.data.current.status as Column;
            console.log('[Kanban] Dropped on column:', newStatus);
        } else {
            // Dropped on a ticket or sortable item - find which column this ticket belongs to
            const overTicket = tickets.find(t => t.id === overId);
            if (overTicket) {
                newStatus = overTicket.status as Column;
                console.log('[Kanban] Dropped on ticket, using its column:', newStatus);
            }
        }

        if (!newStatus) {
            console.log('[Kanban] Could not determine target column');
            toast.error('يرجى السحب إلى عمود صحيح');
            return;
        }

        // Check if valid column
        const validColumns: Column[] = ['open', 'in_progress', 'resolved'];
        if (!validColumns.includes(newStatus)) {
            console.log('[Kanban] Invalid status:', newStatus);
            toast.error('حالة غير صحيحة');
            return;
        }

        const ticket = tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            console.error('[Kanban] Ticket not found:', ticketId);
            return;
        }

        if (ticket.status === newStatus) {
            console.log('[Kanban] Status unchanged');
            return;
        }

        console.log('[Kanban] Updating status:', { from: ticket.status, to: newStatus });

        // Optimistic UI update
        setTickets(prev =>
            prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
        );

        // Update on server
        startTransition(async () => {
            try {
                await updateTicket(ticketId, { status: newStatus! });
                console.log('[Kanban] Status updated successfully');
                toast.success(`تم تحديث الحالة إلى ${COLUMNS.find(c => c.id === newStatus)?.title}`);
            } catch (error) {
                console.error('[Kanban] Update failed:', error);
                toast.error('فشل تحديث التذكرة');
                // Rollback
                setTickets(prev =>
                    prev.map(t => t.id === ticketId ? { ...t, status: ticket.status } : t)
                );
            }
        });
    }

    const getTicketsByStatus = (status: Column) => 
        tickets.filter(t => t.status === status);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 font-bold';
            case 'high': return 'text-orange-600 font-medium';
            case 'medium': return 'text-blue-600';
            default: return 'text-gray-500';
        }
    };

    const activeTicket = tickets.find(t => t.id === activeId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">جاري تحميل التذاكر...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-2xl font-bold">All Tickets</h1>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('kanban')} 
                            className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <NewTicketModal />
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" 
                        placeholder="Search tickets..." 
                    />
                </div>
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Title</th>
                                    <th className="px-6 py-4 font-bold">Customer</th>
                                    <th className="px-6 py-4 font-bold">Priority</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tickets.map(ticket => (
                                    <tr 
                                        key={ticket.id} 
                                        onClick={() => router.push(`/customer-success/tickets/${ticket.id}`)} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{ticket.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {ticket.customer_name[0]}
                                                </div>
                                                {ticket.customer_name}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 uppercase text-xs ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusDropdown 
                                                ticketId={ticket.id}
                                                currentStatus={ticket.status}
                                                onStatusChange={fetchTickets}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* KANBAN VIEW */}
            {viewMode === 'kanban' && (
                <div className="flex-1 overflow-hidden">
                    {isPending && (
                        <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg max-w-fit">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري التحديث...
                        </div>
                    )}
                    
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                            {COLUMNS.map(column => (
                                <DroppableColumn
                                    key={column.id}
                                    column={column}
                                    tickets={getTicketsByStatus(column.id)}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeTicket ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-primary shadow-2xl">
                                    <p className="font-semibold text-sm">{activeTicket.title}</p>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}
        </div>
    );
}
