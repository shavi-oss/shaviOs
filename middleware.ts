import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

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

    const path = request.nextUrl.pathname

    // 2. Protect /tech-panel Routes
    if (path.startsWith('/tech-panel')) {
        // If not logged in, redirect to login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', path)
            return NextResponse.redirect(url)
        }

        // 3. Strict RBAC: Check for Admin Role
        const role = user?.user_metadata?.role || 'user'

        if (role !== 'admin' && role !== 'developer') {
            // Redirect unauthorized users to dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard' // or /unauthorized
            return NextResponse.redirect(url)
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
