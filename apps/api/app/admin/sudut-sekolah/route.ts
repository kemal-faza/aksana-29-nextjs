import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../utils/supabase';
import { getAdminSession } from '../../utils/admin-guard';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sudut_sekolah')
    .select('*')
    .order('urutan');

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

  const { image_path, caption, urutan, is_active } = body;

  if (!image_path || typeof image_path !== 'string') {
    return NextResponse.json({ error: 'Image path wajib diisi' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sudut_sekolah')
    .insert({
    // @ts-expect-error - Supabase type inference needs generated types
      image_path,
      caption: caption || null,
      urutan: typeof urutan === 'number' ? urutan : 1,
      is_active: is_active !== undefined ? is_active : true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
