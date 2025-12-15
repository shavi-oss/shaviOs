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
        const secret = process.env.NAZMLY_WEBHOOK_SECRET;
        if (!secret) {
            console.error('Configuration Error: NAZMLY_WEBHOOK_SECRET is missing');
            return NextResponse.json({ success: false, message: 'Server Configuration Error' }, { status: 500 });
        }

        // 2. Get Signature and Raw Body
        const signature = request.headers.get('x-nzmly-signature');
        const rawBody = await request.text(); // Read raw body for HMAC

        if (!signature) {
             return NextResponse.json(
                { success: false, message: 'Unauthorized: Missing Signature' },
                { status: 401 }
            );
        }

        // 3. Verify Signature
        // The user documentation suggests hashing JSON.stringify(body), but hashing the raw body is safer against formatting differences.
        // However, if the user explicitly provided code using JSON.stringify(req.body), we should be careful.
        // Standard practice is Raw Body. Let's assume Raw Body first as it's the "True" payload.
        // But to be safe and match the snippet exactly: The snippet did `JSON.stringify(req.body)`.
        // In Next.js App Router, `request.json()` parses it.
        // IMPORTANT: If Nazmly sends minified JSON and we verify against stringified parsed JSON, it works ONLY if formatting matches.
        // Code snippet: .update(JSON.stringify(req.body))
        // Let's implement robustly: Hash the received raw text. This is always correct if the sender hashes their output.
        
        const computedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody) 
            .digest('hex');

        // Check compatibility: If raw body check fails, maybe try the "stringify" method if the sender implementation is quirky (Unlikely for a standard webhook).
        // For now, strict RAW body check is the security standard.
        
        if (signature !== computedSignature) {
             console.warn('Invalid Signature:', { received: signature, computed: computedSignature });
             return NextResponse.json(
                { success: false, message: 'Unauthorized: Invalid Signature' },
                { status: 401 }
            );
        }

        // 4. Parse Body
        const body: NazmlyPayload = JSON.parse(rawBody);

        // Basic Validation
        if (!body.email) {
             // Some events might not have email at top level if structure is { type: ..., data: { email: ... } }
             // User example: event.data contains the info.
             // Let's adapt to handle both flat and nested structures based on user snippet
             // Snippet: event.type, event.data
        }
        
        // Adapt extraction logic
        let targetEmail = body.email;
        let firstName = body.first_name || '';
        let lastName = body.last_name || '';
        let phone = body.phone || '';
        let company = body.company || '';
        let notes = body.notes || 'Imported via Nazmly Webhook';

        // Helper to check nested data if top level is missing
        if (!targetEmail && body.data && body.data.email) {
            targetEmail = body.data.email;
            firstName = body.data.first_name || '';
            lastName = body.data.last_name || '';
            phone = body.data.phone || '';
            company = body.data.company || '';
            notes = body.data.notes || notes;
        }

        if (!targetEmail) {
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
