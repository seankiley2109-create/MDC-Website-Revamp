import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response object we can attach cookies to (needed for session refresh)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Guard: if Supabase env vars are not configured, pass through without protection.
  // This prevents a crash during local dev before credentials are added to .env.local.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[middleware] Supabase env vars not set — route protection is disabled.');
    return response;
  }

  // Create a Supabase client that can read/write cookies on this request/response
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session (keeps the JWT from expiring mid-browse)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── /billing — requires auth only ────────────────────────────────────────
  if (pathname.startsWith('/billing')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── /portal — requires auth only ─────────────────────────────────────────
  if (pathname.startsWith('/portal')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── /checkout — requires auth ─────────────────────────────────────────────
  if (pathname.startsWith('/checkout')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/billing',
    '/billing/:path*',
    '/portal',
    '/portal/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
};
