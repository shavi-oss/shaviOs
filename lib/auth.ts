import { cookies } from "next/headers";
import { User, UserRole } from "./types";

// Mock users for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
    "admin@shavi.com": {
        password: "admin123",
        user: {
            id: "1",
            email: "admin@shavi.com",
            full_name: "المدير العام",
            role: "admin",
            department: "management",
            status: "active",
            avatar_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    },
    "sales@shavi.com": {
        password: "sales123",
        user: {
            id: "2",
            email: "sales@shavi.com",
            full_name: "أحمد محمد",
            role: "sales",
            department: "sales",
            status: "active",
            avatar_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    },
    "marketing@shavi.com": {
        password: "marketing123",
        user: {
            id: "3",
            email: "marketing@shavi.com",
            full_name: "سارة علي",
            role: "marketing",
            department: "marketing",
            status: "active",
            avatar_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    },
};

export interface SessionData {
    user: User;
    expiresAt: number;
}

export async function createSession(user: User): Promise<string> {
    const sessionData: SessionData = {
        user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours in seconds
        path: "/",
    });

    return sessionToken;
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session");

    if (!sessionToken) {
        return null;
    }

    try {
        const sessionData: SessionData = JSON.parse(
            Buffer.from(sessionToken.value, "base64").toString()
        );

        // Check if session is expired
        if (sessionData.expiresAt < Date.now()) {
            await destroySession();
            return null;
        }

        return sessionData;
    } catch (error) {
        return null;
    }
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function verifyCredentials(
    email: string,
    password: string
): Promise<User | null> {
    const userRecord = MOCK_USERS[email];

    if (!userRecord || userRecord.password !== password) {
        return null;
    }

    return userRecord.user;
}

export function hasRole(user: User, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(user.role);
}

export function canAccessDepartment(user: User, department: string): boolean {
    // Admin can access all departments
    if (user.role === "admin") {
        return true;
    }

    // Users can access their own department
    return user.department === department;
}
