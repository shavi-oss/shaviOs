// Shavi Academy OS - Type Definitions

export type UserRole =
    | "admin"
    | "developer"
    | "manager"
    | "marketing"
    | "sales"
    | "customer_success"
    | "trainer"
    | "operations"
    | "finance"
    | "hr";

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
export type LeadTemperature = "hot" | "warm" | "cold";
export type StudentStatus = "active" | "graduated" | "dropped" | "suspended";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    department?: string;
    status: string;
    avatar_url?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: string;
    nazmly_id?: string;
    full_name: string;
    email?: string;
    phone?: string;
    marketing_source?: string;
    sales_agent_id?: string;
    status: LeadStatus;
    ai_score?: number;
    temperature?: LeadTemperature;
    predicted_value?: number;
    conversion_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    lead_id?: string;
    nazmly_student_id?: string;
    full_name: string;
    email?: string | null;
    phone?: string | null;
    enrollment_date: string;
    current_course_id?: string | null;
    progress_percentage: number;
    customer_success_agent_id?: string | null;
    status: StudentStatus;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    nazmly_course_id?: string;
    title: string;
    description?: string;
    duration_hours?: number;
    price?: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    nazmly_session_id?: string;
    course_id: string;
    trainer_id?: string;
    title: string;
    scheduled_time: string;
    duration_minutes?: number;
    status: string;
    attendance?: Record<string, boolean>;
    feedback?: Record<string, { rating: number; comment: string }>;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    assigned_to?: string;
    created_by?: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date?: string;
    completed_at?: string;
    related_entity_type?: string;
    related_entity_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    student_id: string;
    enrollment_id?: string;
    amount: number;
    currency: string;
    payment_method?: string;
    status: string;
    payment_date?: string;
    created_at: string;
}

export interface Commission {
    id: string;
    employee_id: string;
    source_type: string;
    source_id?: string;
    amount: number;
    calculated_at: string;
    paid_at?: string;
    status: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message?: string;
    type: "info" | "success" | "warning" | "error";
    category?: string;
    read: boolean;
    action_url?: string;
    created_at: string;
}

export interface DashboardStats {
    totalLeads: number;
    newLeadsToday: number;
    totalStudents: number;
    activeStudents: number;
    totalRevenue: number;
    revenueThisMonth: number;
    pendingTasks: number;
    completedTasksToday: number;
}
