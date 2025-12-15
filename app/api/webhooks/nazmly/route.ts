import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define expected payload structure with flexibility
interface NazmlyPayload {
    type?: string;
    id?: string;
    version?: string;
    email?: string; // Sometimes at root
    first_name?: string;
    last_name?: string;
    phone?: string;
    company?: string;
    notes?: string;
    data?: {
        id?: string;
        name?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        company?: string;
        notes?: string;
        customer?: {
            id?: string;
            name?: string;
            email?: string;
            first_name?: string;
            last_name?: string;
            phone?: string;
            company?: string;
            notes?: string;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Read Raw Body
        const rawBody = await request.text();
        console.log('Incoming Webhook Body:', rawBody); // Critical for debugging

        // 2. Parse JSON
        let body: NazmlyPayload;
        try {
            if (!rawBody) {
                return NextResponse.json({ success: false, message: 'Empty body' }, { status: 400 });
            }
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return NextResponse.json(
                { success: false, message: 'Invalid JSON', error: 'Failed to parse request body' },
                { status: 400 }
            );
        }

        // 3. Unwrap Nested Payload (Detected in Logs)
        // Logs show structure: { body: { ... }, headers: { ... } }
        if (body.body && (body.headers || body.body.type)) {
            console.log('Detected Wrapped Payload (Nazmly Wrapper). Unwrapping...');
            body = body.body as any; // Cast to bypass type check temporarily for unwrapping
        }

        // 4. Handle Test Events (Immediate Success)
        if (body.id === 'swe_testid') {
            console.log('Test Webhook Received (swe_testid). Returning 200 OK.');
            return NextResponse.json(
                { success: true, message: 'Test event received successfully' },
                { status: 200 }
            );
        }

        // 4. Extract Data (Robust Handling)
        
        // Extract email robustly
        let targetEmail = 
            body.email || 
            (body.data && body.data.email) || 
            (body.data && body.data.customer && body.data.customer.email);

        let firstName = 
            body.first_name || 
            (body.data && body.data.first_name) || 
            (body.data && body.data.customer && body.data.customer.first_name) || 
            'Unknown';

        let lastName = 
            body.last_name || 
            (body.data && body.data.last_name) || 
            (body.data && body.data.customer && body.data.customer.last_name) || 
            'Unknown';

        let phone = 
            body.phone || 
            (body.data && body.data.phone) || 
            (body.data && body.data.customer && body.data.customer.phone) || 
            null;

        let company = 
            body.company || 
            (body.data && body.data.company) || 
            (body.data && body.data.customer && body.data.customer.company) || 
            null;

        let notes = body.notes || (body.data && body.data.notes) || (body.data && body.data.customer && body.data.customer.notes) || 'Imported via Nazmly Webhook';

        // Helper to append Reference ID to notes for tracking if available
        if (body.data && body.data.id && body.id !== 'swe_testid') {
            notes = `Ref: ${body.data.id}. ${notes}`; 
        }

        // 5. Validation (Relaxed: Return 200 even if ignored)
        if (!targetEmail) {
            console.warn('Webhook Ignored (Skipped): No email found in payload', body);
            // Return 200 to acknowledge receipt and prevent retries for unsupported events
            return NextResponse.json(
                { success: true, message: 'Event skipped: No email found' },
                { status: 200 }
            );
        }

        // 6. Name Fallback Logic
        if (firstName === 'Unknown' && lastName === 'Unknown') {
             const rawName = body.name || (body.data && body.data.name) || (body.data && body.data.customer && body.data.customer.name);
             if (rawName) {
                const parts = rawName.trim().split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ') || 'Unknown';
             }
        }

        const supabase = await createClient();

        // 7. Check Duplicates
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', targetEmail)
            .single();

        if (existing) {
             console.log(`Duplicate Lead: ${targetEmail} (ID: ${existing.id})`);
             // Log the duplicate event attempt
             await logWebhookEvent(supabase, existing.id, body, `Duplicate Lead skipped (${body.type})`);

             return NextResponse.json(
                { success: true, message: 'Lead already exists', id: existing.id },
                { status: 200 }
            );
        }

        // 8. Insert New Lead
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
            // Return 500 only for actual DB errors we want to retry (or 200 if we want to suppress)
            // Usually 500 is correct for DB failure so they retry
            return NextResponse.json(
                { success: false, message: 'Database error', error: error.message },
                { status: 500 }
            );
        }

        // 9. Audit Log
        await logWebhookEvent(supabase, data.id, body, `Success: ${body.type || 'Generic Event'}`);

        return NextResponse.json(
            { success: true, message: 'Lead created successfully', id: data.id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Webhook Unexpected Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

// Helper to keep code clean
async function logWebhookEvent(supabase: any, recordId: string, body: any, reason: string) {
    try {
        await supabase.from('audit_logs').insert({
            action: 'WEBHOOK_NAZMLY_RECEIVED',
            table_name: 'leads',
            record_id: recordId,
            user_email: 'system@nazmly.webhook',
            new_data: body as any, // Cast to any to prevent type errors
            reason: reason.substring(0, 255) // Ensure we don't overflow if simple text column
        });
    } catch (e) {
        console.error('Audit Log Failed:', e);
    }
}
