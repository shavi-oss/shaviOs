import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ expenses: [], message: "API under development" }); }
export async function POST() { return NextResponse.json({ message: "API under development" }, { status: 201 }); }
