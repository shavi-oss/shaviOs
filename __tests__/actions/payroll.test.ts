import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as payrollActions from '@/app/actions/payroll';

// 1. Mock the Supabase Client
const mockSingle = vi.fn();
const mockUpdate = vi.fn(); 
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

// Create a chainable object that ALSO acts as a Promise-like object for terminal await
// But Supabase is tricky. select() returns a builder. eq() returns a builder.
// Only await triggers the fetch.
// So we make every method return 'this' (the chain), EXCEPT known terminal mock overrides.

const mockChain = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    update: mockUpdate,
    // Add implicit promise interface so 'await builder' works
    then: (resolve: any) => resolve({ data: null, error: null }) 
};

// Wire up methods to return the chain by default
mockFrom.mockReturnValue(mockChain);
mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
// Update is terminal usually, but we can return chain 
mockUpdate.mockReturnValue(mockChain);

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: mockFrom
    }))
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Payroll Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updatePayrollAmounts', () => {
        it('should calculate net salary correctly and update database', async () => {
            // Sequence for mockEq:
            // 1. select().eq('id').single() -> Intermediate (returns chain)
            // 2. update().eq('id') -> Terminal (returns result)
            mockEq
                .mockReturnValueOnce(mockChain) 
                .mockResolvedValueOnce({ error: null }); // For the update call

            // Sequence for mockSingle:
            // Terminal call in first query
            mockSingle.mockResolvedValueOnce({ 
                data: { base_salary: 10000 }, 
                error: null 
            });

            const result = await payrollActions.updatePayrollAmounts('record-123', 2000, 500);

            // Expect successful result
            expect(result.success).toBe(true);

            // Verify calculation logic:
            expect(mockUpdate).toHaveBeenCalledWith({
                bonuses: 2000,
                total_deductions: 500,
                net_salary: 11500
            });
        });

        it('should handle zero deductions and bonuses', async () => {
             // Reset mocks between tests is handled by beforeEach? 
             // Yes, but we need to re-setup the sequence or use default.
             
             mockEq
                .mockReturnValueOnce(mockChain)
                .mockResolvedValueOnce({ error: null });

             mockSingle.mockResolvedValueOnce({ 
                data: { base_salary: 5000 }, 
                error: null 
            });

            await payrollActions.updatePayrollAmounts('record-456', 0, 0);

            expect(mockUpdate).toHaveBeenCalledWith({
                bonuses: 0,
                total_deductions: 0,
                net_salary: 5000
            });
        });

         it('should never result in negative salary', async () => {
            mockEq
                .mockReturnValueOnce(mockChain)
                .mockResolvedValueOnce({ error: null });

            mockSingle.mockResolvedValueOnce({ 
                data: { base_salary: 5000 }, 
                error: null 
            });

            // Deductions > Base
            await payrollActions.updatePayrollAmounts('record-789', 0, 6000);

            expect(mockUpdate).toHaveBeenCalledWith({
                bonuses: 0,
                total_deductions: 6000,
                net_salary: 0 // Should be clamped to 0
            });
        });
    });
});
