import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define routes that don't require authentication
const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const response = NextResponse.next();

    // Create a Supabase client using the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: { path?: string; domain?: string; maxAge?: number; httpOnly?: boolean; secure?: boolean }) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            response.cookies.set({
              name,
              value: '',
              maxAge: 0,
              ...options,
            });
          },
        },
      }
    );

    // Get the session
    const { data: { session } } = await supabase.auth.getSession();

    // Get current path
    const path = request.nextUrl.pathname;

    // Define paths that should bypass middleware
    if (path.startsWith('/_next') || 
        path.startsWith('/api') || 
        path.startsWith('/static') ||
        path === '/favicon.ico') {
      return response;
    }

    // If on auth page and logged in, redirect to home
    if (AUTH_ROUTES.includes(path) && session) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If not logged in and not on a public or auth route, redirect to login
    if (!session && !PUBLIC_ROUTES.includes(path) && !AUTH_ROUTES.includes(path)) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('next', path);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 