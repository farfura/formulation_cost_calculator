import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes - redirect to home if already authenticated
  if (req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/signup') ||
      req.nextUrl.pathname.startsWith('/forgot-password')) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // Protected routes - redirect to login if not authenticated
  if (!session && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 