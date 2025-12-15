'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Check, Loader2 } from 'lucide-react';
import { createCampaign } from '@/app/actions/marketing';
// Adjust import path if needed or install sonner/use-toast
// Assuming global toast or basic alert for now if toast not readily available in inspected files
// I will check for 'sonner' usage in typical files later, but native alert or simple state feedback works for MVP.

export default function NewCampaignModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        
        try {
            const result = await createCampaign(null, formData);
            
            if (result?.success) {
                setOpen(false);
                // Optionally trigger a toast here
            } else {
                setError(result?.message || 'Something went wrong');
            }
        } catch (e) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    حملة جديدة
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="name">اسم الحملة</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="مثلاً: عروض الصيف"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">نوع الحملة</Label>
                            <Select name="type" required defaultValue="social">
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                                    <SelectItem value="social">وسائل تواصل</SelectItem>
                                    <SelectItem value="ads">إعلانات مدفوعة</SelectItem>
                                    <SelectItem value="content">محتوى (SEO)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="budget">الميزانية (ر.س)</Label>
                            <Input
                                id="budget"
                                name="budget"
                                type="number"
                                placeholder="5000"
                                required
                                min="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">تاريخ البدء</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">تاريخ الانتهاء</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                'إنشاء الحملة'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
