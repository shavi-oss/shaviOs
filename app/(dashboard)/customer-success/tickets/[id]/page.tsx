"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Send,
    Paperclip,
    MoreVertical,
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Tag,
    Lock,
    Copy,
    FileText,
    BookOpen,
    Zap,
    ArrowUpRight,
    UserPlus,
    RefreshCw,
    MessageSquare
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'agent' | 'customer' | 'system';
    text: string;
    time: string;
    internal?: boolean;
}

export default function TicketDetailsPage() {
    const { id } = useParams();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState('open');
    const [assignee, setAssignee] = useState('Sarah (You)');
    const [isInternal, setIsInternal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [channel, setChannel] = useState<'email' | 'whatsapp' | 'telegram'>('email');
    const [isTyping, setIsTyping] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'customer', text: 'Hi, I cannot access the React Advanced course material.', time: '10:00 AM' },
        { id: '2', sender: 'system', text: 'Ticket created automatically via Email.', time: '10:01 AM' },
        { id: '3', sender: 'agent', text: 'Hello Ahmed, let me check your enrollment status.', time: '10:15 AM' },
        { id: '4', sender: 'agent', text: 'User verified. Checking permissions...', time: '10:16 AM', internal: true },
    ]);

    // Simulate Real-time Incoming Message
    useEffect(() => {
        if (messages.length > 5) return; // Stop after simulation

        const timer = setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'customer',
                    text: 'I just tried refreshing the page, it works now! Thanks.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }, 3000);
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!replyText.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'agent',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            internal: isInternal
        };
        setMessages([...messages, newMsg]);
        setReplyText('');
    };

    // --- QUICK ACTIONS ---
    const markSolved = () => {
        setStatus('resolved');
        setMessages([...messages, {
            id: Date.now().toString(),
            sender: 'system',
            text: 'Ticket marked as Resolved. Survey sent to customer.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const escalateTicket = () => {
        setAssignee('Manager (Pending)');
        setMessages([...messages, {
            id: Date.now().toString(),
            sender: 'system',
            text: 'Ticket Escalated to Management.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const assignToMe = () => {
        setAssignee('Sarah (You)');
        // Toast notification would go here
    };

    // --- SHORTCUTS ---
    const insertTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const template = e.target.value;
        if (template === 'thanks') setReplyText("Thank you for contacting support. We received your request.");
        else if (template === 'review') setReplyText("I am currently reviewing your account details. Please hold on.");
        else if (template === 'solved') setReplyText("I'm happy to inform you that the issue has been resolved. Is there anything else?");
    };

    const copyCustomerInfo = () => {
        navigator.clipboard.writeText("Name: Ahmed Ali\nEmail: ahmed@gmail.com\nID: 12345");
        // Toast: Copied!
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 shadow-xl m-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* Header with Unified Tabs */}
                <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center px-6 shrink-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm font-mono">#{id}</span>
                                <h1 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                    Login Issue on Portal
                                    {status === 'resolved' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Resolved</span>}
                                    {status === 'open' && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Open</span>}
                                </h1>
                            </div>
                            <div className="flex gap-4 mt-1">
                                <button
                                    onClick={() => setChannel('email')}
                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${channel === 'email' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Mail className="w-3 h-3" /> Email
                                </button>
                                <button
                                    onClick={() => setChannel('whatsapp')}
                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${channel === 'whatsapp' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <MessageSquare className="w-3 h-3" /> WhatsApp
                                </button>
                                <button
                                    onClick={() => setChannel('telegram')}
                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${channel === 'telegram' ? 'text-sky-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Send className="w-3 h-3" /> Telegram
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {status !== 'resolved' ? (
                            <>
                                <button onClick={markSolved} className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                                    <CheckCircle className="w-4 h-4" /> Mark Solved
                                </button>
                                <button onClick={escalateTicket} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-100 flex items-center gap-2 border border-gray-200 transition-all">
                                    <ArrowUpRight className="w-4 h-4" /> Escalate
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setStatus('open')} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-100 flex items-center gap-2 transition-all">
                                <RefreshCw className="w-4 h-4" /> Re-open Ticket
                            </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-black/20 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            {msg.sender === 'system' ? (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-yellow-500" /> {msg.text} • {msg.time}
                                </span>
                            ) : (
                                <div className={`max-w-[70%] group relative ${msg.internal
                                        ? 'bg-yellow-50 border border-yellow-200 shadow-sm text-yellow-900'
                                        : msg.sender === 'agent'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50 dark:shadow-none'
                                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-100'
                                    } p-5 rounded-2xl ${msg.sender === 'agent' ? 'rounded-br-none' : 'rounded-bl-none'}`}>

                                    {msg.internal && (
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-yellow-700 mb-2 border-b border-yellow-200/50 pb-2">
                                            <Lock className="w-3 h-3" /> Private Note
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    <span className={`text-[10px] block mt-2 font-medium opacity-70 ${msg.sender === 'agent' && !msg.internal ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {msg.sender === 'agent' ? 'You' : 'Ahmed Ali'} • {msg.time}
                                    </span>

                                    {/* Message Actions (Hidden by default) */}
                                    <div className={`absolute top-2 ${msg.sender === 'agent' ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                        <button className="p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-blue-500"><Copy className="w-3 h-3" /></button>
                                        <button className="p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-red-500"><AlertTriangle className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2 text-gray-400 text-xs ml-4 animate-in fade-in duration-300">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                            </div>
                            Customer is typing...
                        </div>
                    )}
                </div>

                {/* Advanced Reply Box */}
                <div className={`p-4 border-t border-gray-200 dark:border-gray-800 transition-colors ${isInternal ? 'bg-yellow-50/50' : 'bg-white dark:bg-gray-900'}`}>
                    {/* Shortcuts Toolbar */}
                    <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                        <select onChange={insertTemplate} className="text-xs border border-gray-200 rounded-lg py-1 px-2 bg-white hover:border-blue-500 transition-colors cursor-pointer">
                            <option value="">✨ Quick Reply Templates...</option>
                            <option value="thanks">Thanks for contacting</option>
                            <option value="review">Reviewing Issue</option>
                            <option value="solved">Issue Resolved</option>
                        </select>

                        <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                            <BookOpen className="w-3 h-3" /> Insert KB Article
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1"></div>

                        <button
                            onClick={() => setIsInternal(false)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${!isInternal ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            Public Reply
                        </button>
                        <button
                            onClick={() => setIsInternal(true)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${isInternal ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Lock className="w-3 h-3 inline mr-1" /> Internal Note
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-2 focus-within:ring-2 ring-primary/20 transition-all">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            className={`w-full bg-transparent border-none focus:ring-0 p-2 text-sm max-h-40 min-h-[80px] resize-none ${isInternal ? 'placeholder-yellow-600/50' : ''}`}
                            placeholder={isInternal ? "Write a private note visible only to your team..." : "Type your reply... (Press Enter to send)"}
                        />
                        <div className="flex justify-between items-center px-2 pb-1 border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                            <div className="flex gap-1">
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"><Paperclip className="w-4 h-4" /></button>
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"><MessageSquare className="w-4 h-4" /></button>
                            </div>
                            <button onClick={handleSend} className={`px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 transform active:scale-95 ${isInternal ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
                                <Send className="w-4 h-4" /> Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer 360 Sidebar */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 overflow-y-auto hidden lg:block">
                {/* User Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                            AA
                        </div>
                        <button onClick={copyCustomerInfo} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-colors" title="Copy Customer Info">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Ahmed Ali</h3>
                        <p className="text-sm text-gray-500">Student • Joined Dec 2024</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> VIP
                            </span>
                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">
                                High Risk
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-6 pt-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Recent Activity
                    </h3>
                    <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900"></div>
                            <p className="text-xs text-gray-500 mb-0.5">Today, 10:00 AM</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Opened Ticket #1025</p>
                            <p className="text-xs text-gray-400">"Login Issue on Portal"</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
                            <p className="text-xs text-gray-500 mb-0.5">Yesterday</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Purchase Course</p>
                            <p className="text-xs text-gray-400">"Advanced React Patterns"</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 border-2 border-white dark:border-gray-900"></div>
                            <p className="text-xs text-gray-500 mb-0.5">3 Days Ago</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Login Successful</p>
                        </div>
                    </div>
                </div>

                {/* Ticket Meta */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center group cursor-pointer hover:bg-white p-2 rounded-lg transition-colors" onClick={assignToMe}>
                            <span className="text-xs font-bold text-gray-500">Assignee</span>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className={assignee === 'Sarah (You)' ? 'text-blue-600' : 'text-gray-700'}>{assignee}</span>
                                {assignee !== 'Sarah (You)' && <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />}
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs font-bold text-gray-500 mb-2">Contact Details</span>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> ahmed@gmail.com</div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> +20 123 456 789</div>
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Cairo, Egypt</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
