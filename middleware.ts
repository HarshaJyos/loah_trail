import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Non-www to www redirection for production
  if (req.headers.get('host') === 'loah.in') {
    url.hostname = 'www.loah.in';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
