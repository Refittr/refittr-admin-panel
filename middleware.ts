import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware disabled - auth handled in layout
  return NextResponse.next()
}

export const config = {
  matcher: []
}
