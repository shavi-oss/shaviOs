import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse("Email and password are required", 400);
        }

        const user = await verifyCredentials(email, password);

        if (!user) {
            // Warn log for security monitoring
            logger.warn("Failed login attempt", { email });
            return errorResponse("Invalid email or password", 401);
        }

        await createSession(user);

        logger.info("User logged in", { userId: user.id, email: user.email });
        return successResponse({ user });
    } catch (error) {
        logger.error("Login error", { error });
        return errorResponse("An error occurred during login", 500);
    }
}
