import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

// Define validated schema instead of 'any' interface
const nazmlySchema = z.object({
    type: z.string().optional(),
    id: z.string().optional(),
    version: z.string().optional(),
    body: z.any().optional(), // Allow for nested payload unwrapping
    headers: z.any().optional(),
    email: z.string().email().optional().or(z.literal('')),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    name: z.string().optional(),
    notes: z.string().optional(),
    data: z.object({
        id: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        notes: z.string().optional(),
        customer: z.object({
            email: z.string().email().optional().or(z.literal('')),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            name: z.string().optional(),
            phone: z.string().optional(),
            company: z.string().optional(),
            notes: z.string().optional(),
        }).passthrough().optional()
    }).passthrough().optional()
}).passthrough();

type NazmlyData = z.infer<typeof nazmlySchema>;

export async function POST(request: NextRequest) {
    try {
        // 1. Read Raw Body
        const rawBody = await request.text();
        console.log('Incoming Webhook Body:', rawBody);

        // 2. Parse JSON & Validate with Zod
        let body: NazmlyData;
        try {
            if (!rawBody) {
                return NextResponse.json({ success: false, message: 'Empty body' }, { status: 400 });
            }
            const json = JSON.parse(rawBody);
            
            // 3. Unwrap Nested Payload (Detected in Logs)
            // Logs show structure: { body: { ... }, headers: { ... } }
            // We check this BEFORE validation because the wrapper might not match the inner schema
            let payload = json;
            if (payload.body && (payload.headers || payload.body.type)) {
                console.log('Detected Wrapped Payload (Nazmly Wrapper). Unwrapping...');
                payload = payload.body;
            }

            const parsed = nazmlySchema.safeParse(payload);
            
            if (!parsed.success) {
                 console.error('Validation Error:', parsed.error);
                 return NextResponse.json({ success: false, message: 'Invalid Payload', errors: parsed.error }, { status: 400 });
            }
            body = parsed.data;

        } catch (e) {
            console.error('JSON Parse Error:', e);
            return NextResponse.json(
                { success: false, message: 'Invalid JSON', error: 'Failed to parse request body' },
                { status: 400 }
            );
        }

        // 4. Handle Test Events
        if (body.id === 'swe_testid') {
            console.log('Test Webhook Received (swe_testid). Returning 200 OK.');
            return NextResponse.json(
                { success: true, message: 'Test event received successfully' },
                { status: 200 }
            );
        }

        // 5. Extract Data (Robust Handling with Typed Access)
        
        let targetEmail = 
            body.email || 
            body.data?.email || 
            body.data?.customer?.email;

        let firstName = 
            body.first_name || 
            body.data?.first_name || 
            body.data?.customer?.first_name || 
            'Unknown';

        let lastName = 
            body.last_name || 
            body.data?.last_name || 
            body.data?.customer?.last_name || 
            'Unknown';

        let phone = 
            body.phone || 
            body.data?.phone || 
            body.data?.customer?.phone || 
            null;

        let company = 
            body.company || 
            body.data?.company || 
            body.data?.customer?.company || 
            null;

        let notes = body.notes || body.data?.notes || body.data?.customer?.notes || 'Imported via Nazmly Webhook';

        // Helper to append Reference ID to notes
        if (body.data?.id && body.id !== 'swe_testid') {
            notes = `Ref: ${body.data.id}. ${notes}`; 
        }

        // 6. Validation (Relaxed: Return 200 even if ignored)
        if (!targetEmail) {
            console.warn('Webhook Ignored (Skipped): No email found in payload', body);
            return NextResponse.json(
                { success: true, message: 'Event skipped: No email found' },
                { status: 200 }
            );
        }

        // 7. Name Fallback Logic
        if (firstName === 'Unknown' && lastName === 'Unknown') {
             const rawName = body.name || body.data?.name || body.data?.customer?.name;
             if (rawName) {
                const parts = rawName.trim().split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ') || 'Unknown';
             }
        }

        const supabase = await createClient();

        // 8. Check Duplicates
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', targetEmail)
            .single();

        if (existing) {
             console.log(`Duplicate Lead: ${targetEmail} (ID: ${existing.id})`);
             await logWebhookEvent(supabase, existing.id, body as Record<string, any>, `Duplicate Lead skipped (${body.type})`);

             return NextResponse.json(
                { success: true, message: 'Lead already exists', id: existing.id },
                { status: 200 }
            );
        }

        // 9. Insert New Lead
        const { data, error } = await supabase
            .from('leads')
            .insert({
                first_name: firstName,
                last_name: lastName,
                email: targetEmail,
                phone: phone,
                company: company,
                source: 'nazmly',
                status: 'new',
                notes: notes,
            })
            .select()
            .single();

        if (error) {
            console.error('Webhook Insert Error:', error);
            return NextResponse.json(
                { success: false, message: 'Database error', error: error.message },
                { status: 500 }
            );
        }

        // 10. Audit Log
        await logWebhookEvent(supabase, data.id, body as Record<string, any>, `Success: ${body.type || 'Generic Event'}`);

        return NextResponse.json(
            { success: true, message: 'Lead created successfully', id: data.id },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Webhook Unexpected Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', error_details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function logWebhookEvent(supabase: SupabaseClient, recordId: string, body: Record<string, any>, reason: string) {
    try {
        await supabase.from('audit_logs').insert({
            action: 'WEBHOOK_NAZMLY_RECEIVED',
            table_name: 'leads',
            record_id: recordId,
            user_email: 'system@nazmly.webhook',
            new_data: body,
            reason: reason.substring(0, 255)
        });
    } catch (e) {
        console.error('Audit Log Failed:', e);
    }
}
