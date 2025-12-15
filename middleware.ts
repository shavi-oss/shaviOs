import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RateLimiter } from './lib/rate-limit'

// Initialize Rate Limiter
// Limit: 500 unique tokens (IPs) per minute
const limiter = new RateLimiter({
    uniqueTokenPerInterval: 500,
    interval: 60000,
})

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 0. RATE LIMITING (Spam Protection)
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip'
    const path = request.nextUrl.pathname

    // Apply strict limit to API and Auth routes (20 requests per minute)
    if (path.startsWith('/api') || path.startsWith('/login') || path.startsWith('/signup')) {
        try {
            await limiter.check(20, ip)
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            )
        }
    }

    // Create a Supabase client configured for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    )
                },
            },
        }
    )

    // 1. Refresh Session if needed
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. Protect /tech-panel Routes
    if (path.startsWith('/tech-panel')) {
        // If not logged in, redirect to login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', path)
            return NextResponse.redirect(url)
        }

        // 3. Strict RBAC: Check for Admin/Dev Role for Tech Panel
        const role = user?.user_metadata?.role || 'user';

        if (role !== 'admin' && role !== 'developer') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // 4. General Department Access Control
    if (user) {
        const role = user?.user_metadata?.role || 'user';
        const currentPath = request.nextUrl.pathname;

        // Map paths to allowed roles
        // Admin, Developer, and Manager are generally trusted
        const isSuperUser = ['admin', 'developer', 'manager'].includes(role);

        if (!isSuperUser) {
            if (currentPath.startsWith('/hr') && role !== 'hr') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (currentPath.startsWith('/finance') && role !== 'finance') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (currentPath.startsWith('/sales') && role !== 'sales') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (currentPath.startsWith('/operations') && role !== 'operations') {
                // Trainers can see specific sub-routes, handled by generic 'operations' check? 
                // For now, strict: only 'operations' role. Trainers might need /operations/trainers/me
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/ (API routes - handled separately usually, but good to include if protecting APIs)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
