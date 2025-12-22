"use client";

import { useState, useEffect, useTransition } from 'react';
import { UserCircle, ChevronDown } from 'lucide-react';
import { assignTicket } from '@/app/actions/tickets';
import { toast } from 'sonner';
import { AssignmentConfirmDialog } from './AssignmentConfirmDialog';

interface Agent {
    id: string;
    full_name: string;
    email: string;
}

interface AssigneeSelectorProps {
    ticketId: string;
    ticketTitle: string;
    currentStatus: string;
    currentAssignedTo?: string | null;
    onAssignmentChange?: () => void;
}

export function AssigneeSelector({ 
    ticketId,
    ticketTitle,
    currentStatus,
    currentAssignedTo,
    onAssignmentChange 
}: AssigneeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAssignment, setPendingAssignment] = useState<{
        agentId: string | null;
        agentName: string | null;
    } | null>(null);

    // Fetch agents on mount
    useEffect(() => {
        async function loadAgents() {
            try {
                // Fetch customer success agents from profiles
                const response = await fetch('/api/agents/customer-success');
                if (response.ok) {
                    const data = await response.json();
                    setAgents(data);
                }
            } catch (error) {
                console.error('Failed to load agents:', error);
            } finally {
                setLoading(false);
            }
        }
        loadAgents();
    }, []);

    const currentAgent = agents.find(a => a.id === currentAssignedTo);

    const handleAssignmentRequest = (agentId: string | null, agentName: string | null) => {
        setIsOpen(false);
        
        // Log the assignment request
        console.log('[TICKET_ASSIGN_REQUEST]', {
            timestamp: new Date().toISOString(),
            ticketId,
            requestedAgent: agentId,
            currentAssignee: currentAssignedTo,
        });

        // Store pending assignment and show confirmation
        setPendingAssignment({ agentId, agentName });
        setShowConfirmDialog(true);
    };

    const handleConfirmAssignment = () => {
        if (!pendingAssignment) return;

        const { agentId, agentName } = pendingAssignment;

        // Log assignment confirmation
        console.log('[TICKET_ASSIGN_CONFIRMED]', {
            timestamp: new Date().toISOString(),
            ticketId,
            action: agentId ? 'assign' : 'unassign',
            targetAgent: agentId,
            previousAssignee: currentAssignedTo,
            newStatus: agentId ? 'in_progress' : 'open',
        });

        startTransition(async () => {
            try {
                await assignTicket(ticketId, agentId);
                
                // Log success
                console.log('[TICKET_ASSIGN_SUCCESS]', {
                    timestamp: new Date().toISOString(),
                    ticketId,
                    assignedTo: agentId,
                });

                toast.success(`تم تخصيص التذكرة إلى ${agentName || 'غير مخصص'}`);
                onAssignmentChange?.();
            } catch (error) {
                // Log error
                console.error('[TICKET_ASSIGN_ERROR]', {
                    timestamp: new Date().toISOString(),
                    ticketId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                // Show specific error message based on error type
                if (error instanceof Error && error.message.includes('Insufficient permissions')) {
                    toast.error('ليس لديك صلاحية لتخصيص التذاكر');
                } else {
                    toast.error(
                        error instanceof Error 
                            ? error.message 
                            : 'فشل تخصيص التذكرة'
                    );
                }
            } finally {
                setShowConfirmDialog(false);
                setPendingAssignment(null);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-between items-center p-2">
                <span className="text-xs font-bold text-gray-500">Assignee</span>
                <span className="text-sm text-gray-400">جاري التحميل...</span>
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                <div className="flex justify-between items-center group cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                    <span className="text-xs font-bold text-gray-500">Assignee</span>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isPending}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        <span className={currentAgent ? 'text-blue-600' : 'text-gray-500'}>
                            {isPending ? 'جاري التحديث...' : (currentAgent?.full_name || 'غير مخصص')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsOpen(false)}
                        />
                        
                        {/* Dropdown Menu */}
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                            {/* Unassign Option */}
                            <button
                                onClick={() => handleAssignmentRequest(null, null)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                                    !currentAssignedTo ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <UserCircle className={`w-5 h-5 ${
                                        !currentAssignedTo ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            !currentAssignedTo ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                                        }`}>
                                            غير مخصص
                                        </p>
                                        <p className="text-xs text-gray-500">Unassigned</p>
                                    </div>
                                </div>
                                {!currentAssignedTo && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                            </button>

                            {/* Agent Options */}
                            {agents.map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => handleAssignmentRequest(agent.id, agent.full_name)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                                        agent.id === currentAssignedTo ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserCircle className={`w-5 h-5 ${
                                            agent.id === currentAssignedTo ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                agent.id === currentAssignedTo ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                                            }`}>
                                                {agent.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{agent.email}</p>
                                        </div>
                                    </div>
                                    {agent.id === currentAssignedTo && (
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AssignmentConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                onConfirm={handleConfirmAssignment}
                ticketTitle={ticketTitle}
                currentStatus={currentStatus}
                currentAssignee={currentAgent?.full_name || null}
                targetAgent={pendingAssignment?.agentName || null}
            />
        </>
    );
}
