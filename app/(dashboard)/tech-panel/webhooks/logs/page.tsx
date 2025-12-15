'use client';

import { useEffect, useState } from 'react';
import { getWebhookLogs } from '@/app/actions/audit';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Activity } from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    recrod_id: string;
    created_at: string;
    new_data: any;
    reason: string;
}

export default function WebhookLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const result = await getWebhookLogs();
            if (result.success) {
                setLogs(result.data as any || []);
            } else {
                console.error('Failed to fetch logs:', result.error);
            }
        } catch (error) {
            console.error('Error calling fetchLogs:', error);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="w-8 h-8 text-blue-500" />
                        سجلات الويب هوك (Webhook Logs)
                    </h1>
                    <p className="text-gray-500 mt-2">متابعة البيانات الواردة من Nazmly</p>
                </div>
                <button 
                    onClick={fetchLogs} 
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 border rounded-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">التوقت</TableHead>
                            <TableHead>الحدث</TableHead>
                            <TableHead>البيانات المستلمة</TableHead>
                            <TableHead>رقم السجل</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                                    لا توجد سجلات بعد...
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium" dir="ltr">
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs font-mono max-w-[400px] overflow-auto h-20">
                                            {JSON.stringify(log.new_data, null, 2)}
                                        </pre>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.reason}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
