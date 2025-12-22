import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { createStudent, getStudents, getStudentById, updateStudent } from '@/app/actions/students';

// Mock Auth Session
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn().mockResolvedValue({
        user: {
            id: 'test-admin-id',
            role: 'admin',
            email: 'admin@shavierp.com'
        }
    })
}));

// Mock Next.js Internals
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

// Mock FormData
class MockFormData {
    private data = new Map<string, string>();
    append(key: string, value: string) { this.data.set(key, value); }
    get(key: string) { return this.data.get(key) || null; }
}

describe('Students Management Integration', () => {
    let testStudentId: string;
    const uniqueId = Date.now().toString();
    const testEmail = `test.student.${uniqueId}@example.com`;

    it('should create a new student', async () => {
        const formData = new MockFormData();
        formData.append('full_name', 'Integration Test Student');
        formData.append('email', testEmail);
        formData.append('phone', '1234567890');
        formData.append('status', 'active');

        // Cast to any to bypass strict FormData type check in test
        const result = await createStudent(formData as any);
        
        if (!result.success) {
            console.error('Create Failed:', result);
        }

        expect(result.success).toBe(true);
        expect(result.student).toBeDefined();
        testStudentId = result.student.id;
    });

    it('should fetch students list with search', async () => {
        const { data, count } = await getStudents('Integration', 'active', 1, 10);
        
        expect(data.length).toBeGreaterThan(0);
        expect(data[0].full_name).toContain('Integration');
        expect(count).toBeGreaterThan(0);
    });

    it('should fetch student details (360 view)', async () => {
        if (!testStudentId) return; // Skip if create failed

        const result = await getStudentById(testStudentId);
        
        expect(result).toBeDefined();
        if(!result) return;
        
        expect(result.profile.id).toBe(testStudentId);
        expect(result.profile.email).toBe(testEmail);
        expect(Array.isArray(result.enrollments)).toBe(true);
        expect(Array.isArray(result.tickets)).toBe(true);
    });

    it('should update student details', async () => {
        if (!testStudentId) return;

        const formData = new MockFormData();
        formData.append('full_name', 'Updated Integration Student');
        formData.append('email', testEmail); // Keep mandatory fields if schema requires
        formData.append('status', 'at_risk');

        const result = await updateStudent(testStudentId, formData as any);
        
        if (!result.success) {
            console.error('Update Failed:', result);
        }

        expect(result.success).toBe(true);
        expect(result.student.full_name).toBe('Updated Integration Student');
        expect(result.student.status).toBe('at_risk');
    });

    it('should handle validation errors', async () => {
        const formData = new MockFormData();
        formData.append('full_name', 'A'); // Too short
        formData.append('email', 'not-an-email'); // Invalid email

        const result = await createStudent(formData as any);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Validation Failed');
        expect(result.errors).toHaveProperty('full_name');
        expect(result.errors).toHaveProperty('email');
    });
});
