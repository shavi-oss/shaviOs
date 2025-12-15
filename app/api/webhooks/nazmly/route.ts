import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define expected payload structure
// Adjust this to match actual Nazmly output if known, otherwise generic is safe
interface NazmlyPayload {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Security Check
        const apiKey = request.headers.get('x-api-key');
        const validKey = process.env.NAZMLY_WEBHOOK_SECRET || 'shavi-secret-key-123';
        
        if (apiKey !== validKey) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Invalid API Key' },
                { status: 401 }
            );
        }

        // 2. Parse Body
        const body: NazmlyPayload = await request.json();
        
        // Basic Validation
        if (!body.email) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: email' },
                { status: 400 }
            );
        }

        // 3. Name Logic handling
        let firstName = body.first_name || '';
        let lastName = body.last_name || '';

        if (!firstName && body.name) {
            const parts = body.name.trim().split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || 'Unknown';
        }

        if (!firstName) firstName = 'Unknown';
        if (!lastName) lastName = 'Unknown';

        // 4. Database Insertion
        const supabase = await createClient();
        
        // Check for existing lead to avoid duplicates (optional but recommended)
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', body.email)
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
                email: body.email,
                phone: body.phone || null,
                company: body.company || null,
                source: 'nazmly',
                status: 'new',
                notes: body.notes || 'Imported via Webhook',
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

        // 5. Log to Audit Logs
        try {
            await supabase.from('audit_logs').insert({
                action: 'WEBHOOK_NAZMLY_RECEIVED',
                table_name: 'leads',
                record_id: data.id,
                user_email: 'system@nazmly.webhook',
                new_data: body as any, // Cast to JSON
                reason: 'Imported via Nazmly Webhook'
            });
        } catch (logError) {
            console.error('Failed to write audit log for webhook', logError);
            // Don't fail the request just because logging failed
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
