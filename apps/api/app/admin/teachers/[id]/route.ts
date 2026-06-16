import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../utils/supabase';
import { getAdminSession } from '../../../utils/admin-guard';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
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

  const { nama, jabatan, mapel, ekstra, image_path, urutan } = body;
  const updateData: Record<string, unknown> = {};

  if (nama !== undefined) {
    if (typeof nama !== 'string' || nama.trim().length === 0) {
      return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 });
    }
    updateData.nama = nama.trim();
  }
  if (jabatan !== undefined) updateData.jabatan = jabatan;
  if (mapel !== undefined) updateData.mapel = Array.isArray(mapel) ? mapel : [];
  if (ekstra !== undefined) updateData.ekstra = ekstra || null;
  if (image_path !== undefined) updateData.image_path = image_path || null;
  if (urutan !== undefined) updateData.urutan = urutan;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('teachers')
    // @ts-expect-error - Supabase type inference needs generated types
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
