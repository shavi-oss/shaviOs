import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    const supabase = createClient();
    const results = [];

    try {
        // 1. Search Leads
        const { data: leads } = await supabase
            .from('leads')
            .select('id, first_name, last_name, email, status')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(3);

        if (leads) {
            results.push(...leads.map(l => ({
                type: 'lead',
                id: l.id,
                title: `${l.first_name} ${l.last_name}`,
                subtitle: l.email,
                url: `/marketing/leads/${l.id}`,
                status: l.status
            })));
        }

        // 2. Search Students
        const { data: students } = await supabase
            .from('students')
            .select('id, full_name, email, status')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(3);

        if (students) {
            results.push(...students.map(s => ({
                type: 'student',
                id: s.id,
                title: s.full_name,
                subtitle: s.email,
                url: `/customer-success/students/${s.id}`, // Detail page might not exist yet, but link is ready
                status: s.status
            })));
        }

        // 3. Search Deals
        const { data: deals } = await supabase
            .from('deals')
            .select('id, title, value, stage')
            .ilike('title', `%${query}%`)
            .limit(3);

        if (deals) {
            results.push(...deals.map(d => ({
                type: 'deal',
                id: d.id,
                title: d.title,
                subtitle: `${d.value?.toLocaleString()} EGP`,
                url: `/sales/pipeline`, // Link to pipeline for now
                status: d.stage
            })));
        }

    } catch (error) {
        console.error('Search error:', error);
    }

    return NextResponse.json(results);
}
