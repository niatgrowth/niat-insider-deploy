import { NextResponse } from 'next/server';
import { requireProxySession } from '@/lib/proxySession';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export async function GET() {
  const session = await requireProxySession();
  if (!session.ok) return session.response;
  const access = session.accessToken!;

  const res = await fetch(`${API_BASE}/api/me/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  const me = await res.json().catch(() => ({}));
  const profileUser = me.user as
    | { id?: string; username?: string; phone_number?: string }
    | undefined;

  const data = {
    id: String(me.id ?? profileUser?.id ?? ''),
    username: String(me.username ?? profileUser?.username ?? ''),
    email: (me.email as string | null) ?? null,
    phone_number: (me.phone_number as string | null) ?? profileUser?.phone_number ?? null,
    role: String(me.role ?? ''),
    is_verified_senior: Boolean(me.is_verified_senior),
    is_onboarded: Boolean(me.is_onboarded),
    niat_review_completed: Boolean(me.niat_review_completed),
    needs_password_set: Boolean(me.needs_password_set),
    profile: me.profile ?? null,
    badge: me.badge ?? null,
  };

  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await requireProxySession();
  if (!session.ok) return session.response;
  const access = session.accessToken!;

  const body = await req.json().catch(() => ({}));
  const upstream = await fetch(`${API_BASE}/api/auth/me/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
