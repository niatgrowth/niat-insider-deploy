import { NextRequest } from 'next/server';
import { proxyReviewsGet } from '@/lib/reviews/proxyUpstream';

export async function GET(request: NextRequest) {
  return proxyReviewsGet(request, 'dashboard/senior/');
}
