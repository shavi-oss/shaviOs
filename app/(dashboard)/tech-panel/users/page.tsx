"use client";

import { useEffect, useState } from 'react';
import {
    Shield,
    User,
    Search,
    CheckCircle,
    AlertTriangle,
    Lock,
    Save
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Mock Data for now (until API is live)
const MOCK_USERS = [
    { id: '1', email: 'admin@shavierp.com', role: 'admin', last_sign_in: '2025-12-10T08:00:00Z' },
    { id: '2', email: 'manager@shavierp.com', role: 'manager', last_sign_in: '2025-12-09T14:30:00Z' },
    { id: '3', email: 'sales@shavierp.com', role: 'sales', last_sign_in: '2025-12-10T09:15:00Z' },
    { id: '4', email: 'trainer@shavierp.com', role: 'trainer', last_sign_in: '2025-12-08T11:00:00Z' },
    { id: '5', email: 'hr@shavierp.com', role: 'hr', last_sign_in: '2025-12-10T08:45:00Z' },
];

export default function UserRolesPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    // In a real implementation:
    // useEffect(() => { fetch('/api/admin/users').then(...) }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setSaving(userId);

        // Simulating API Call
        setTimeout(() => {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setSaving(null);
        }, 800);

        // await fetch('/api/admin/users', { 
        //    method: 'PATCH', 
        //    body: JSON.stringify({ userId, role: newRole }) 
        // });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        Access Control Manager
                    </h1>
                    <p className="text-gray-500 mt-1">Manage user roles and system permissions (RBAC).</p>
                </div>
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Changes affect user access immediately.
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Search users..." />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-900 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Current Role</th>
                            <th className="px-6 py-4">Last Active</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user.email}</p>
                                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={saving === user.id}
                                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold capitalize cursor-pointer transition-all ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                user.role === 'sales' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    user.role === 'hr' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                    >
                                        <option value="user">User (No Access)</option>
                                        <option value="admin">👑 Admin</option>
                                        <option value="manager">🛡️ Manager</option>
                                        <option value="sales">💰 Sales</option>
                                        <option value="operations">⚙️ Operations</option>
                                        <option value="hr">👥 HR & Finance</option>
                                        <option value="trainer">🎓 Trainer</option>
                                        <option value="developer">👨‍💻 Developer</option>
                                    </select>
                                    {saving === user.id && <span className="ml-2 text-xs text-gray-400 animate-pulse">Saving...</span>}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.last_sign_in).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full w-fit">
                                        <CheckCircle className="w-3 h-3" /> Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Matrix Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Admin & Manager
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">Can access all modules. Admin can also access Tech Panel.</p>
                    <div className="h-1 bg-purple-500 w-full rounded"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-400" />
                        Department Roles
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">Restricted to their specific Dashboard (Sales, Ops, HR).</p>
                    <div className="h-1 bg-blue-500 w-2/3 rounded"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-gray-400" />
                        Security Level
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">Middleware enforcement is active on all routes.</p>
                    <div className="h-1 bg-green-500 w-full rounded"></div>
                </div>
            </div>
        </div>
    );
}
