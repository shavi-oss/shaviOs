import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ totalEmployees: 45, onLeave: 3, pendingLeave: 5 }); }
