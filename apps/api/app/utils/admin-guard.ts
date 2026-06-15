import { NextResponse } from 'next/server';
import { verifyJWT } from './auth';

interface AdminSession {
  userId: string;
  email: string;
}

export async function getAdminSession(
  request: Request
): Promise<AdminSession | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token);

    // Check if admin is whitelisted
    const { getSupabaseAdmin } = await import('./supabase');
    const supabase = getSupabaseAdmin();
    const { data: admin } = await supabase
      .from('allowed_admins')
      .select('id')
      .eq('email', payload.email)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: not an admin' },
        { status: 403 }
      );
    }

    return { userId: payload.sub, email: payload.email };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
