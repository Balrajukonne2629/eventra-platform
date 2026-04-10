import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Add the routes you want to protect here. Wait, normally this is at src/middleware.js
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Example of paths we want to protect (customize this to your app later)
  // For demo, let's pretend `/dashboard` and API modifying routes are protected
  const protectedRoutes = ['/dashboard', '/api/events/create'];
  
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Extract token
    const token = request.cookies.get('eventra_token')?.value;

    if (!token) {
      // Redirect to login or return Unauthorized on API
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // User is logged in! We proceed. Role check is explicitly omitted for now.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets and auth API
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
