import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // TODO: Implement stats fetching from database
        const mockStats = {
            overview: {
                active_students: 1654,
                at_risk_students: 23
            },
            support: {
                open_tickets: 12
            },
            nps: {
                nps_score: 85
            }
        };

        return NextResponse.json(mockStats);
    } catch (error) {
        console.error('Error fetching customer success stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
