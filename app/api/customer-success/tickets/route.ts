import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ tickets: [], message: "API under development" }); }
export async function POST() { return NextResponse.json({ message: "API under development" }, { status: 201 }); }
