import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // TODO: Implement course listing
        return NextResponse.json({
            courses: [],
            message: "API endpoint under development"
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // TODO: Implement course creation
        return NextResponse.json({
            message: "Course creation endpoint under development",
            data: body
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
}
