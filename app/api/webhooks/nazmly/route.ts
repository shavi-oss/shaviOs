import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Define expected payload structure
interface NazmlyPayload {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
    type?: string; 
    data?: any; 
}

export async function POST(request: NextRequest) {
    try {
        // 1. Get Secret
        const secret = (process.env.NAZMLY_WEBHOOK_SECRET || '').trim();
        if (!secret) {
            console.error('Configuration Error: NAZMLY_WEBHOOK_SECRET is missing');
            return NextResponse.json({ success: false, message: 'Server Configuration Error' }, { status: 500 });
        }

        // 2. Get Signature and Raw Body
        const signature = request.headers.get('x-nzmly-signature');
        const rawBody = await request.text(); // Read raw body for HMAC

        // Debug Logging (Temporary: Remove in production once stable)
        console.log(`Webhook Debug: Length=${rawBody.length}, SigHeader=${signature ? 'Present' : 'Missing'}`);

        if (!signature) {
             return NextResponse.json(
                { success: false, message: 'Unauthorized: Missing Signature' },
                { status: 401 }
            );
        }

        // 3. Verify Signature
        const computedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody) 
            .digest('hex');

        if (signature !== computedSignature) {
             console.warn('Signature Mismatch:', { 
                received: signature, 
                computed: computedSignature,
                bodySnippet: rawBody.substring(0, 50) 
             });
             return NextResponse.json(
                { success: false, message: 'Unauthorized: Invalid Signature' },
                { status: 401 }
            );
        }

        // 4. Parse Body
        const body: NazmlyPayload = JSON.parse(rawBody);
        
        // Adapt extraction logic for various event types
        // Case 1: store.customer.created -> data.email
        // Case 2: store.order.created -> data.customer.email
        let targetEmail = body.email;
        let firstName = body.first_name || '';
        let lastName = body.last_name || '';
        let phone = body.phone || '';
        let company = body.company || '';
        let notes = body.notes || 'Imported via Nazmly Webhook';

        // Helper to check nested data
        if (body.data) {
            // Direct data (Customer Created)
            if (body.data.email) {
                targetEmail = body.data.email;
                firstName = body.data.first_name || firstName;
                lastName = body.data.last_name || lastName;
                phone = body.data.phone || phone;
                company = body.data.company || company;
            }
            // Nested Customer (Order Created)
            else if (body.data.customer && body.data.customer.email) {
                targetEmail = body.data.customer.email;
                firstName = body.data.customer.first_name || firstName;
                lastName = body.data.customer.last_name || lastName;
                phone = body.data.customer.phone || phone;
            }
            // Fallback for ID only
            if (body.data.id) notes = `Ref ID: ${body.data.id} - ${notes}`;
        }

        if (!targetEmail) {
            console.warn('Skipping Webhook: No email found in payload', body);
            return NextResponse.json(
                { success: false, message: 'Missing required field: email' },
                { status: 400 }
            );
        }

        // Name Logic
        if (!firstName && body.name) {
            const parts = body.name.trim().split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || 'Unknown';
        }
        if (!firstName) firstName = 'Unknown';
        if (!lastName) lastName = 'Unknown';

        // 5. Database Insertion
        const supabase = await createClient();
        
        // Check for existing
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', targetEmail)
            .single();

        if (existing) {
             return NextResponse.json(
                { success: true, message: 'Lead already exists', id: existing.id },
                { status: 200 }
            );
        }

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

        // 6. Log to Audit Logs
        try {
            await supabase.from('audit_logs').insert({
                action: 'WEBHOOK_NAZMLY_RECEIVED',
                table_name: 'leads',
                record_id: data.id,
                user_email: 'system@nazmly.webhook',
                new_data: body as any,
                reason: `Event: ${body.type || 'Generic Import'}`
            });
        } catch (logError) {
            console.error('Failed to write audit log for webhook', logError);
        }

        return NextResponse.json(
            { success: true, message: 'Lead created successfully', id: data.id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Webhook unexpected error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
