"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { createStudent } from '@/app/actions/students';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';

const initialState = {
    success: false,
    message: '',
    errors: {},
    student: null
};

export default function NewStudentPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(createStudent, initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle successful submission
    useEffect(() => {
        if (state.success && state.student) {
            // Navigate to the new student's profile
            router.push(`/customer-success/students/${state.student.id}`);
        }
    }, [state, router]);

    const handleSubmit = (formData: FormData) => {
        setIsSubmitting(true);
        formAction(formData);
        // Reset after a delay to allow state update
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 pb-12">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/customer-success/students')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Students
                </button>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Create a new student profile and begin tracking their academic journey.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <form action={handleSubmit} className="p-8 space-y-6">
                        {/* Global Error Message */}
                        {state.message && !state.success && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {state.message}
                                    </p>
                                    {Object.keys(state.errors || {}).length > 0 && (
                                        <ul className="mt-2 text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                                            {Object.entries(state.errors || {}).map(([field, messages]) => (
                                                <li key={field}>
                                                    {field}: {Array.isArray(messages) ? messages[0] : messages}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                        state.errors?.full_name 
                                            ? 'border-red-300 dark:border-red-700' 
                                            : 'border-gray-300 dark:border-gray-700'
                                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400`}
                                    placeholder="Enter student's full name"
                                />
                            </div>
                            {state.errors?.full_name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {state.errors.full_name[0]}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                        state.errors?.email 
                                            ? 'border-red-300 dark:border-red-700' 
                                            : 'border-gray-300 dark:border-gray-700'
                                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400`}
                                    placeholder="student@example.com"
                                />
                            </div>
                            {state.errors?.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {state.errors.email[0]}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                        state.errors?.phone 
                                            ? 'border-red-300 dark:border-red-700' 
                                            : 'border-gray-300 dark:border-gray-700'
                                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400`}
                                    placeholder="+1234567890"
                                />
                            </div>
                            {state.errors?.phone && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {state.errors.phone[0]}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Include country code if international
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Initial Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                defaultValue="active"
                                className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="at_risk">At Risk</option>
                                <option value="completed">Completed</option>
                                <option value="paused">Paused</option>
                                <option value="dropped">Dropped</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Most new students start as "Active"
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => router.push('/customer-success/students')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Add Student
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>💡 Tip:</strong> After creating the student, you can add course enrollments and link support tickets from their profile page.
                    </p>
                </div>
            </div>
        </div>
    );
}
