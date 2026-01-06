import { createClerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Clerk proxy route to bypass SSL issues with custom domain
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const clerkUrl = `https://api.clerk.com${url.pathname.replace('/clerk', '')}${url.search}`;

  try {
    const response = await fetch(clerkUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const clerkUrl = `https://api.clerk.com${url.pathname.replace('/clerk', '')}${url.search}`;
  const body = await request.text();

  try {
    const response = await fetch(clerkUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
