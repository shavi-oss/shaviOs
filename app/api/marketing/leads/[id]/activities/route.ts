import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { type, description } = body;

        if (!type || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('lead_activities')
            .insert([
                {
                    lead_id: id,
                    type,
                    description,
                    created_by: 'system_user' // identifying user would require auth context
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Also update the lead's last_contact field
        await supabase
            .from('leads')
            .update({ last_contact: new Date().toISOString() })
            .eq('id', id);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating activity:', error);
        return NextResponse.json(
            { error: 'Error creating activity' },
            { status: 500 }
        );
    }
}
