import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../utils/supabase';
import { getAdminSession } from '../../utils/admin-guard';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const supabase = getSupabaseAdmin();
  let query = supabase.from('teachers').select('*', { count: 'exact' });

  if (search) query = query.ilike('nama', `%${search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to).order('urutan').order('nama');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count, page, limit });
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

  const { nama, jabatan, mapel, ekstra, image_path, urutan } = body;

  if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
  }

  if (!jabatan || typeof jabatan !== 'string') {
    return NextResponse.json({ error: 'Jabatan wajib diisi' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('teachers')
    .insert({
    // @ts-expect-error - Supabase type inference needs generated types
      nama: nama.trim(),
      jabatan,
      mapel: Array.isArray(mapel) ? mapel : [],
      ekstra: ekstra || null,
      image_path: image_path || null,
      urutan: typeof urutan === 'number' ? urutan : 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
