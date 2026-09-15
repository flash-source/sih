import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

async function handleRequest(request: NextRequest, method: string) {
  const { pathname, searchParams } = request.nextUrl;
  const backendPath = pathname.replace(/^\/api/, '');

  const url = new URL(`${FASTAPI_URL}${backendPath}`);
  url.search = searchParams.toString();

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length'); 

  let body = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: res.headers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}