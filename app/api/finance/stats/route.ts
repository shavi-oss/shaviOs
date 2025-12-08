import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ totalRevenue: 2450000, pendingInvoices: 12, totalExpenses: 54000, netProfit: 2396000 }); }
