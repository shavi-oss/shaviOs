"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Upload,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function LeaveRequestPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null as File | null
    });

    const [daysCount, setDaysCount] = useState(0);
    const [leaveBalance] = useState(15);

    const calculateDays = () => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
            setDaysCount(diff > 0 ? diff : 0);
        }
    };

    const handleSubmit = () => {
        // Save to database
        console.log('Submitting leave request:', formData);
        router.push('/hr/leave');
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <Link href="/hr/leave" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" />
                Back to Leave Management
            </Link>

            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Request Leave
                </h1>
                <p className="text-gray-500 text-sm mt-1">Submit a new leave request for approval</p>
            </div>

            {/* Leave Balance */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-400">Your Leave Balance</span>
                    <span className="text-2xl font-black text-blue-600">{leaveBalance} days</span>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Leave Type *</label>
                    <select
                        value={formData.leave_type}
                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Date *</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData({ ...formData, start_date: e.target.value });
                                setTimeout(calculateDays, 100);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">End Date *</label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => {
                                setFormData({ ...formData, end_date: e.target.value });
                                setTimeout(calculateDays, 100);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {daysCount > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Days</span>
                            <span className="text-lg font-black text-primary">{daysCount} days</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">Remaining After</span>
                            <span className="text-sm font-bold text-gray-700">{leaveBalance - daysCount} days</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">Reason *</label>
                    <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                        rows={4}
                        placeholder="Please provide details about your leave request..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Attachment (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Medical certificate or supporting documents</p>
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold hover:bg-gray-200">
                            Choose File
                        </button>
                    </div>
                </div>

                {daysCount > leaveBalance && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                            <strong>Insufficient Leave Balance!</strong>
                            <p>You are requesting {daysCount} days but only have {leaveBalance} days available.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={() => router.push('/hr/leave')}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={daysCount > leaveBalance || !formData.start_date || !formData.end_date || !formData.reason}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Request
                </button>
            </div>
        </div>
    );
}
