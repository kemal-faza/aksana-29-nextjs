import { NextResponse } from 'next/server';
import { getAdminSession } from '../../utils/admin-guard';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    id: session.userId,
    email: session.email,
  });
}
