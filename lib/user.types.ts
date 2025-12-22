import { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extract the role type from the Profile row to ensure it matches DB constraints
export type UserRole = Profile['role'];

// Extended User type that includes Auth email and DB profile data
export type User = Profile & {
    email: string;
    status: string; // Legacy field required by UI, defaults to 'active'
};
