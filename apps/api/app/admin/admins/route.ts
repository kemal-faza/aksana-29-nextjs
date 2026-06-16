import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../utils/supabase';
import { getAdminSession } from '../../utils/admin-guard';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('allowed_admins')
    .select('id, email, is_active, created_at')
    .eq('is_active', true)
    .order('created_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if already exists
  const { data: existing } = await supabase
    .from('allowed_admins')
    .select('id, is_active')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    // @ts-expect-error - Supabase type inference needs generated types
    if (existing.is_active) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
    }
    // Reactivate
    const { data, error } = await supabase
      .from('allowed_admins')
      // @ts-expect-error - Supabase type inference needs generated types
      .update({
        is_active: true,
        deactivated_at: null,
        deactivated_by: null,
      })
      // @ts-expect-error - Supabase type inference needs generated types
      .eq('id', existing.id)
      .select('id, email, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  }

  const { data, error } = await supabase
    .from('allowed_admins')
    .insert({
    // @ts-expect-error - Supabase type inference needs generated types
      email: email.toLowerCase(),
      is_active: true,
      created_by: session.userId,
    })
    .select('id, email, is_active, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
