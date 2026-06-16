import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../utils/supabase';
import { getAdminSession } from '../../utils/admin-guard';
import { StudentPublicSchema, KELAS_REGEX } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get('kelas');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);

  const supabase = getSupabaseAdmin();
  let query = supabase.from('students').select('*', { count: 'exact' });

  if (kelas) query = query.eq('kelas', kelas);
  if (search) query = query.ilike('nama', `%${search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to).order('nama');

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

  const { nama, kelas, jabatan, kesan, pesan, ttl, ekstra, image_path } = body;

  if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
  }

  if (!kelas || typeof kelas !== 'string' || !KELAS_REGEX.test(kelas)) {
    return NextResponse.json({ error: 'Kelas tidak valid' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .insert({
    // @ts-expect-error - Supabase type inference needs generated types
      nama: nama.trim(),
      kelas,
      jabatan: jabatan || null,
      kesan: kesan || null,
      pesan: pesan || null,
      ttl: ttl || null,
      ekstra: ekstra || null,
      image_path: image_path || null,
      created_by: session.userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sanitized = StudentPublicSchema.parse(data);
  return NextResponse.json(sanitized, { status: 201 });
}
