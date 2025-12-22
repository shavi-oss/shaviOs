import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        // Check authentication
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check authorization (only admin/manager can view agents list)
        const allowedRoles = ['admin', 'manager', 'customer_success'];
        if (!allowedRoles.includes(session.user.role || '')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'customer_success')
            .order('full_name');

        if (error) {
            console.error('Error fetching CS agents:', error);
            return NextResponse.json(
                { error: 'Failed to fetch agents' },
                { status: 500 }
            );
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
