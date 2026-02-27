/**
 * Next.js Middleware - Gestión de Sesiones y Protección de Rutas
 * 
 * Este middleware:
 * 1. Actualiza la sesión de Supabase en cada request
 * 2. Protege rutas que requieren autenticación
 * 3. Redirige a login si no hay sesión activa
 * 4. Redirige a dashboard si ya está autenticado e intenta ir a login/register
 */

import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { updateSession } from '@/lib/supabase/middleware'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard']

// Auth routes that authenticated users shouldn't access  
const authRoutes = ['/login', '/register']

// Routes handled by client-side protection only
const clientProtectedRoutes = ['/chat', '/calendar']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  logger.debug('Middleware', 'Checking:', pathname)

  try {
    // Refresh session if expired and sync cookies - required for Server Components
    const { response, user, error } = await updateSession(request)

    if (error) {
      logger.debug('Middleware', 'Auth check error:', error)
    }

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
      // Preservar cookies configuradas por updateSession
      const redirectResponse = NextResponse.redirect(redirectUrl)
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      });
      return redirectResponse
    }

    // For client protected routes, let them through - client will handle protection
    if (isClientProtectedRoute) {
      logger.debug('Middleware', 'Allowing client-protected route through')
      // Don't block these routes - let client-side handle authentication
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && user) {
      logger.debug('Middleware', 'User authenticated, redirecting to /dashboard')
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      });
      return redirectResponse
    }
    logger.debug('Middleware', 'Access allowed')

    return response

  } catch (error) {
    logger.error('Middleware', 'Error:', error)
    return NextResponse.next({ request })
  }
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
