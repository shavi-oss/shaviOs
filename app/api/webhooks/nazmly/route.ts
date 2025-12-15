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
        name?: string; // Added to fix build error
        email?: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        company?: string;
        notes?: string;
        customer?: {
            id?: string;
            name?: string; // Added to fix build error
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
        // 1. Parse Payload
        // We removed HMAC check as per request, so we can parse JSON directly.
        let body: NazmlyPayload;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON', error: 'Failed to parse request body' },
                { status: 400 }
            );
        }

        // 2. Extract Data (Robust Handling)
        let targetEmail = body.email;
        let firstName = body.first_name || '';
        let lastName = body.last_name || '';
        let phone = body.phone || '';
        let company = body.company || '';
        let notes = body.notes || `Imported via Nazmly Webhook`;

        // Check for nested 'data' object (Common in Nazmly v2025+)
        if (body.data) {
            // Case A: Event "store.customer.created" (Data is the customer)
            if (body.data.email) {
                targetEmail = body.data.email;
                firstName = body.data.first_name || firstName;
                lastName = body.data.last_name || lastName;
                phone = body.data.phone || phone;
                company = body.data.company || company;
            }
            // Case B: Event "store.order.created" (Data contains customer object)
            else if (body.data.customer && body.data.customer.email) {
                targetEmail = body.data.customer.email;
                firstName = body.data.customer.first_name || firstName;
                lastName = body.data.customer.last_name || lastName;
                phone = body.data.customer.phone || phone;
            }
            
            // Append Reference ID to notes for tracking
            if (body.data.id) {
                notes = `Ref: ${body.data.id}. ${notes}`; 
            }
        }

        // 3. Validation
        if (!targetEmail) {
            console.warn('Webhook Ignored: No email found', body);
            return NextResponse.json(
                { success: false, message: 'Missing required field: email' },
                { status: 400 }
            );
        }

        // 4. Name Fallback Logic
        if (!firstName && !lastName) {
            // If we have a 'name' field somewhere
            const rawName = body.name || (body.data && body.data.name) || (body.data && body.data.customer && body.data.customer.name);
            if (rawName) {
                const parts = rawName.trim().split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ') || 'Unknown';
            } else {
                firstName = 'Unknown';
                lastName = 'Unknown';
            }
        } else {
            if (!firstName) firstName = 'Unknown';
            if (!lastName) lastName = 'Unknown';
        }

        const supabase = await createClient();

        // 5. Check Duplicates
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', targetEmail)
            .single();

        if (existing) {
             // Log the duplicate event attempt anyway
             await logWebhookEvent(supabase, existing.id, body, 'Duplicate Lead skipped');

             return NextResponse.json(
                { success: true, message: 'Lead already exists', id: existing.id },
                { status: 200 }
            );
        }

        // 6. Insert New Lead
        const { data, error } = await supabase
            .from('leads')
            .insert({
                first_name: firstName,
                last_name: lastName,
                email: targetEmail,
                phone: phone || null,
                company: company || null,
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

        // 7. Audit Log
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
