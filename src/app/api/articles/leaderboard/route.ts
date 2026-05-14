import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function getAuthHeader(token: string | undefined): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  try {
    const res = await fetch(`${API_BASE}/api/articles/leaderboard/`, {
      method: 'GET',
      headers: getAuthHeader(accessToken),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ detail: 'Backend connection failed' }, { status: 502 });
  }
}
