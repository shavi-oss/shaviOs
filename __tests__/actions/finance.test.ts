import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as financeActions from '@/app/actions/finance';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

const mockChain = {
    select: mockSelect,
    eq: mockEq,
    insert: mockInsert,
    then: (resolve: any) => resolve({ data: null, error: null })
};

mockFrom.mockReturnValue(mockChain);
mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockInsert.mockReturnValue(mockChain);

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: mockFrom
    }))
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn()
    }
}));

describe('Finance Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initializeBudgets', () => {
        it('should use database categories if available', async () => {
            // Flow: 
            // 1. .select('*').eq(...)  -> eq is terminal
            // 2. .insert(...).select() -> select is terminal

            // 1. eq is called. It should return the data.
            mockEq.mockResolvedValueOnce({
                data: [
                    { name: 'Custom Cat', default_allocation: 50000, name_ar: 'test', is_active: true }
                ],
                error: null
            });
            
            // 2. select is called (terminal).
            // BUT select is ALSO called in step 1 (intermediate).
            // So:
            // Call 1 (intermediate): returns chain
            // Call 2 (terminal): returns data
            mockSelect
                .mockReturnValueOnce(mockChain)
                .mockResolvedValueOnce({
                    data: [{ id: 'b-1', category: 'Custom Cat', allocated: 50000, percentage: 0 }],
                    error: null
                });

            const result = await financeActions.initializeBudgets('2025-05');

            expect(result[0].category).toBe('Custom Cat');
            expect(result[0].allocated).toBe(50000);
        });

        it('should fallback to hardcoded defaults if DB error or empty', async () => {
            // 1. eq returns empty
            mockEq.mockResolvedValueOnce({
                data: [],
                error: null
            });

            // 2. select behavior
            // Call 1 (intermediate): returns chain
            // Call 2 (terminal): returns data
            mockSelect
                .mockReturnValueOnce(mockChain)
                .mockResolvedValueOnce({
                    data: [{ id: 'b-default', category: 'Salaries', allocated: 900000 }],
                    error: null
                });

            await financeActions.initializeBudgets('2025-05');

            // Verify valid insert call with the fallback array (Salaries, Rent, etc.)
            // We check the first argument of the insert call
            const insertCallArgs = mockInsert.mock.calls[0][0];
            expect(insertCallArgs.length).toBe(9); // 9 default categories
            expect(insertCallArgs[0].category).toBe('Salaries');
        });
    });
});
