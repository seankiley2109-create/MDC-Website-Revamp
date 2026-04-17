/**
 * Partner attribution catch-all.
 *
 * Any single-segment URL that doesn't match an explicit Next.js page
 * (e.g. /nedbank, /fnb, /absa) lands here. We set a 30-day HttpOnly
 * attribution cookie and redirect to /pos.
 *
 * Next.js resolves static/explicit routes first — this only fires for
 * paths that have no matching page.tsx or layout.tsx.
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME    = 'partner_attribution';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> },
): Promise<NextResponse> {
  const { partner } = await params;

  // Sanitise: only allow lowercase alphanumeric + hyphens to prevent injection
  const slug = partner.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const attribution = JSON.stringify({
    handle:      slug,
    landingPage: `/${slug}`,
    capturedAt:  new Date().toISOString(),
  });

  const response = NextResponse.redirect(new URL('/pos', request.url));

  response.cookies.set(COOKIE_NAME, attribution, {
    maxAge:   COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
  });

  return response;
}
