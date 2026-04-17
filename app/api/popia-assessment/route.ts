/**
 * DEPRECATED — superseded by /api/assessment (app/api/assessment/route.ts)
 *
 * This route is no longer called by any frontend component.
 * The active assessment endpoint is POST /api/assessment which handles
 * both 'security' and 'popia' assessment types with full Monday.com +
 * Supabase integration.
 *
 * Kept here to return a helpful 410 Gone rather than a 404 in case any
 * old bookmark or third-party tool still targets this URL.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:   'This endpoint has moved. Use POST /api/assessment instead.',
    },
    { status: 410 },
  );
}
