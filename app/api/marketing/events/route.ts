
import { NextResponse } from 'next/server';
import { triggerMarketingEvent } from '@/lib/marketing/events';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { event, payload } = body;

        if (!event || !payload) {
            return NextResponse.json({ error: 'Missing event or payload' }, { status: 400 });
        }

        // Trigger the event asynchronously (fire and forget pattern for speed)
        triggerMarketingEvent(event, payload).catch(err =>
            console.error('Background event processing failed:', err)
        );

        return NextResponse.json({ success: true, message: 'Event queued' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
