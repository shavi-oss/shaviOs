import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ dashboard: { insights: [], metrics: {} }, message: "API under development" }); }
