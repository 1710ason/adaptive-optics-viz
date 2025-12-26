import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Filter out static assets to reduce log noise
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 1. Get Network Data
  // x-forwarded-for often contains a list, the first one is the real client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
  
  // 2. Get Geo Data (Provided by Vercel Edge Network)
  const geo = {
    city: request.headers.get('x-vercel-ip-city') || 'unknown',
    country: request.headers.get('x-vercel-ip-country') || 'unknown',
    region: request.headers.get('x-vercel-ip-country-region') || 'unknown',
    latitude: request.headers.get('x-vercel-ip-latitude'),
    longitude: request.headers.get('x-vercel-ip-longitude'),
  };

  // 3. Device & Referrer
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'direct';

  // 4. Log to Vercel Runtime Logs
  console.log(JSON.stringify({
    level: 'INFO',
    type: 'VISITOR_ENTRY',
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    ip,
    location: `${geo.city}, ${geo.region}, ${geo.country}`,
    coordinates: `${geo.latitude}, ${geo.longitude}`,
    device: userAgent,
    source: referer
  }, null, 2));

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
