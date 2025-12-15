
import { describe, it, vi, expect } from 'vitest';
import { generatePayrollForMonth } from '../app/actions/payroll';

// ---------------------------------------------------------
// MOCK SUPABASE TO SIMULATE 1000 RECORDS
// ---------------------------------------------------------
const MOCK_EMPLOYEE_COUNT = 1000;

// Mock data generators
const generateMockEmployees = () => {
    return Array.from({ length: MOCK_EMPLOYEE_COUNT }, (_, i) => ({
        id: `emp-${i}`,
        first_name: `Employee`,
        last_name: `${i}`,
        department: 'Engineering',
        base_salary: 10000 + (i * 10),
        join_date: '2020-01-01',
        status: 'active'
    }));
};

const generateMockSessions = () => {
    return Array.from({ length: 500 }, (_, i) => ({
        id: `sess-${i}`,
        trainer_id: `emp-${i % 50}`, 
        start_date: '2025-05-01',
        status: 'completed'
    }));
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: (table: string) => {
            // Return a chainable object that resolves to data when awaited
            const chain = {
                select: () => chain,
                eq: () => chain,
                gte: () => chain,
                lte: () => chain,
                neq: () => chain,
                in: () => chain,
                insert: () => chain,
                // The 'then' method makes it awaitable
                then: (resolve: any) => {
                    // Logic to return correct data based on table context
                    if (table === 'employees') {
                        resolve({ data: generateMockEmployees(), error: null, count: MOCK_EMPLOYEE_COUNT });
                    } else if (table === 'course_sessions') {
                       resolve({ data: generateMockSessions(), error: null, count: 500 });
                    } else if (table === 'trainers') {
                        // Return mock trainers if requested
                        resolve({ 
                            data: Array.from({ length: 50 }, (_, i) => ({ id: `emp-${i}`, hourly_rate: 100 })), 
                            error: null 
                        });
                    } else {
                        // Default empty for payroll_records check etc
                        resolve({ data: [], error: null, count: 0 });
                    }
                }
            };
            return chain;
        }
    }))
}));

vi.mock('next/cache', () => ({
    revalidatePath: () => {}
}));

describe('Performance Stress Test', () => {
    it('should process 1000 payroll records in under 5 seconds', async () => {
        const start = performance.now();
        
        await generatePayrollForMonth('2025-05');
        
        const end = performance.now();
        
        const duration = end - start;
        console.log(`Duration: ${duration.toFixed(2)}ms for ${MOCK_EMPLOYEE_COUNT} records`);
        
        expect(duration).toBeLessThan(5000);
    });
});
