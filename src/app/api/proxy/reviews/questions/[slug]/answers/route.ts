import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const upstream = await fetch(
    `${API_BASE}/api/questions/${encodeURIComponent(slug)}/answers/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const upstream = await fetch(
    `${API_BASE}/api/questions/${encodeURIComponent(slug)}/answers/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    }
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
