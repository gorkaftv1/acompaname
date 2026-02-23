/**
 * Next.js Middleware - Gestión de Sesiones y Protección de Rutas
 * 
 * Este middleware:
 * 1. Actualiza la sesión de Supabase en cada request
 * 2. Protege rutas que requieren autenticación
 * 3. Redirige a login si no hay sesión activa
 * 4. Redirige a dashboard si ya está autenticado e intenta ir a login/register
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/utils/logger'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard']

// Auth routes that authenticated users shouldn't access  
const authRoutes = ['/login', '/register']

// Routes handled by client-side protection only
const clientProtectedRoutes = ['/chat', '/calendar']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  logger.debug('Middleware', 'Checking:', pathname)

  // Create response
  let response = NextResponse.next({
    request,
  })

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
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isClientProtectedRoute = clientProtectedRoutes.some(route => pathname.startsWith(route))
    logger.debug('Middleware', 'Auth check', {
      pathname,
      hasUser: !!user,
      isProtectedRoute,
      isAuthRoute,
    })

    // Only block server-side protected routes, let client handle the rest
    if (isProtectedRoute && !user) {
      logger.debug('Middleware', 'Blocking protected route, redirecting to /login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For client protected routes, let them through - client will handle protection
    if (isClientProtectedRoute) {
      logger.debug('Middleware', 'Allowing client-protected route through')
      // Don't block these routes - let client-side handle authentication
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && user) {
      logger.debug('Middleware', 'User authenticated, redirecting to /dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    logger.debug('Middleware', 'Access allowed')
  } catch (error) {
    logger.error('Middleware', 'Error:', error)
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
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
