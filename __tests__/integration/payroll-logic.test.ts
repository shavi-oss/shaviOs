import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmployeePayrollHelper, generateTrainerPayrollHelper } from '@/lib/payroll/generators';

// Mock valid data
const MOCK_EMPLOYEES = [
    { id: 'emp1', first_name: 'John', last_name: 'Doe', salary: 5000, status: 'active' },
    { id: 'emp2', first_name: 'Jane', last_name: 'Smith', salary: 6000, status: 'active' }
];

const MOCK_SESSIONS = [
    { trainer_id: 'trainer1', start_date: '2025-01-10', status: 'completed' },
    { trainer_id: 'trainer1', start_date: '2025-01-12', status: 'completed' },
    { trainer_id: 'trainer2', start_date: '2025-01-15', status: 'completed' }
];

const MOCK_TRAINERS = [
    { id: 'trainer1', hourly_rate: 100 },
    { id: 'trainer2', hourly_rate: 150 }
];

describe('Payroll Logic Generators', () => {
    let mockSupabase: any;

    beforeEach(() => {
        // Factory for creating a chainable query builder mock
        const createQueryBuilder = (response: any) => {
            const builder: any = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                lte: vi.fn().mockReturnThis(),
                neq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                insert: vi.fn().mockImplementation((data) => {
                    // Capture data for assertions if needed, return success
                    return Promise.resolve({ error: null, data });
                }),
                // Make it thenable to simulate await
                then: (onfulfilled?: Function) => {
                    return Promise.resolve(response).then(onfulfilled as any);
                }
            };
            return builder;
        };

        mockSupabase = {
            from: vi.fn((table: string) => {
                 // Return a default builder that can be overridden by specific tests via the mockSupabase.from.mockImplementation if needed
                 // But better to have default behaviors here for simple cases
                 return createQueryBuilder({ data: [], count: 0, error: null }); 
            }),
            _createBuilder: createQueryBuilder
        };
    });

    describe('generateEmployeePayrollHelper', () => {
        it('returns 0 if payroll already exists', async () => {
            // Setup: 'payroll_records' returns count > 0
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'payroll_records') return mockSupabase._createBuilder({ count: 5 });
                return mockSupabase._createBuilder({ data: [] });
            });

            const count = await generateEmployeePayrollHelper('2025-01', '2025-01-01', '2025-01-31', mockSupabase);
            
            expect(count).toBe(0);
            expect(mockSupabase.from).toHaveBeenCalledWith('payroll_records');
        });

        it('returns 0 if no active employees found', async () => {
            // Setup: 'payroll_records' count=0, 'employees' data=[]
             mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'payroll_records') return mockSupabase._createBuilder({ count: 0 });
                if (table === 'employees') return mockSupabase._createBuilder({ data: [] });
                return mockSupabase._createBuilder({});
            });

            const count = await generateEmployeePayrollHelper('2025-01', '2025-01-01', '2025-01-31', mockSupabase);

            expect(count).toBe(0);
            expect(mockSupabase.from).toHaveBeenCalledWith('employees');
        });

        it('generates payroll records for active employees', async () => {
            // Setup: Employees exist
            const insertSpy = vi.fn().mockResolvedValue({ error: null });
            
             mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'payroll_records') {
                    const builder = mockSupabase._createBuilder({ count: 0 });
                    builder.insert = insertSpy;
                    return builder;
                }
                if (table === 'employees') return mockSupabase._createBuilder({ data: MOCK_EMPLOYEES });
                return mockSupabase._createBuilder({});
            });

            const count = await generateEmployeePayrollHelper('2025-01', '2025-01-01', '2025-01-31', mockSupabase);

            expect(count).toBe(2);
            expect(insertSpy).toHaveBeenCalledTimes(1);
            
            const insertCall = insertSpy.mock.calls[0][0];
            expect(insertCall).toHaveLength(2);
            expect(insertCall[0].employee_id).toBe('emp1');
            expect(insertCall[0].base_salary).toBe(5000);
            expect(insertCall[0].period).toBe('2025-01');
        });
    });

    describe('generateTrainerPayrollHelper', () => {
        it('calculates trainer payments correctly based on sessions', async () => {
            // Setup complex chaining
            const insertSpy = vi.fn().mockResolvedValue({ error: null });

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'trainer_payments') {
                     const builder = mockSupabase._createBuilder({ count: 0 });
                     builder.insert = insertSpy;
                     return builder;
                }
                if (table === 'course_sessions') return mockSupabase._createBuilder({ data: MOCK_SESSIONS });
                if (table === 'trainers') return mockSupabase._createBuilder({ data: MOCK_TRAINERS });
                return mockSupabase._createBuilder({});
            });

            const count = await generateTrainerPayrollHelper('2025-01-01', '2025-01-31', mockSupabase);

            expect(count).toBe(2); // 2 trainers
            expect(insertSpy).toHaveBeenCalled();
            
            const insertCall = insertSpy.mock.calls[0][0];
            
            // Trainer 1: 2 sessions * 100 = 200
            const t1 = insertCall.find((r: any) => r.trainer_id === 'trainer1');
            expect(t1).toBeDefined();
            expect(t1.amount).toBe(200);
            expect(t1.sessions_count).toBe(2);

            // Trainer 2: 1 session * 150 = 150
            const t2 = insertCall.find((r: any) => r.trainer_id === 'trainer2');
            expect(t2).toBeDefined();
            expect(t2.amount).toBe(150);
        });
    });
});
