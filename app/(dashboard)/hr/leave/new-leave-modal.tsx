"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createLeaveRequest } from '@/app/actions/hr';
import { leaveRequestSchema } from '@/lib/validations'; // Assuming this export exists
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface NewLeaveModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Ensure local schema matches validation file if not directly importable or needs refinement
// We'll reuse the one from lib/validations if possible, otherwise redefine.
// Assuming leaveRequestSchema is exported from lib/validations/index.ts.

type LeaveFormData = z.infer<typeof leaveRequestSchema>;

export function NewLeaveModal({ open, onClose, onSuccess }: NewLeaveModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LeaveFormData>({
        resolver: zodResolver(leaveRequestSchema),
        defaultValues: {
            type: 'annual',
            reason: '',
            // Dates are handled as Date objects or strings depending on Input type="date"
            // For hook-form with input type=date, usually string "YYYY-MM-DD" works best
        }
    });

    const onSubmit = async (data: LeaveFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', data.type);
            formData.append('start_date', new Date(data.start_date).toISOString());
            formData.append('end_date', new Date(data.end_date).toISOString());
            if (data.attachment_url) formData.append('attachment_url', data.attachment_url);
            
            // Call server action directly with dummy prevState to match signature
            const result = await createLeaveRequest({ success: false, message: '' }, formData);

            if (result.success) {
                toast.success('تم إرسال طلب الإجازة بنجاح');
                form.reset();
                onSuccess();
                onClose();
            } else {
                toast.error(result.message || 'حدث خطأ أثناء إرسال الطلب');
                if (result.errors) {
                    // Manually set field errors if returned from server
                    Object.entries(result.errors).forEach(([key, value]) => {
                        // @ts-ignore
                        form.setError(key as any, { type: 'server', message: value[0] });
                    });
                }
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>طلب إجازة جديد</DialogTitle>
                    <DialogDescription>
                        قم بملء النموذج التالي لتقديم طلب إجازة جديد.
                        سيتم مراجعة الطلب من قبل مدير القسم.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">نوع الإجازة</Label>
                            <Select
                                onValueChange={(value) => form.setValue('type', value as any)}
                                defaultValue={form.getValues('type')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="annual">إجازة سنوية</SelectItem>
                                    <SelectItem value="sick">إجازة مرضية</SelectItem>
                                    <SelectItem value="emergency">إجازة طارئة</SelectItem>
                                    <SelectItem value="unpaid">بدون راتب</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.type && (
                                <p className="text-xs text-red-500">{form.formState.errors.type.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">تاريخ البداية</Label>
                            <Input
                                id="start_date"
                                type="date"
                                {...form.register('start_date', { valueAsDate: true })}
                            />
                            {form.formState.errors.start_date && (
                                <p className="text-xs text-red-500">{form.formState.errors.start_date.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">تاريخ النهاية</Label>
                            <Input
                                id="end_date"
                                type="date"
                                {...form.register('end_date', { valueAsDate: true })}
                            />
                            {form.formState.errors.end_date && (
                                <p className="text-xs text-red-500">{form.formState.errors.end_date.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">سبب الإجازة (اختياري)</Label>
                        <Textarea
                            id="reason"
                            placeholder="اكتب سبب الإجازة هنا..."
                            className="resize-none"
                            {...form.register('reason')}
                        />
                        {form.formState.errors.reason && (
                            <p className="text-xs text-red-500">{form.formState.errors.reason.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                'تقديم الطلب'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
