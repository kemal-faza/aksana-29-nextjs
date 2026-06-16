import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../utils/supabase';
import { getAdminSession } from '../../../utils/admin-guard';
import { StudentPublicSchema, KELAS_REGEX } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { nama, kelas, jabatan, kesan, pesan, ttl, ekstra, image_path } = body;

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length === 0)) {
    return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 });
  }

  if (kelas !== undefined && (typeof kelas !== 'string' || !KELAS_REGEX.test(kelas))) {
    return NextResponse.json({ error: 'Kelas tidak valid' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { updated_by: session.userId };
  if (nama !== undefined) updateData.nama = nama.trim();
  if (kelas !== undefined) updateData.kelas = kelas;
  if (jabatan !== undefined) updateData.jabatan = jabatan || null;
  if (kesan !== undefined) updateData.kesan = kesan || null;
  if (pesan !== undefined) updateData.pesan = pesan || null;
  if (ttl !== undefined) updateData.ttl = ttl || null;
  if (ekstra !== undefined) updateData.ekstra = ekstra || null;
  if (image_path !== undefined) updateData.image_path = image_path || null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    // @ts-expect-error - Supabase type inference needs generated types
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sanitized = StudentPublicSchema.parse(data);
  return NextResponse.json(sanitized);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
