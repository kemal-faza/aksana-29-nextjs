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
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
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

  const { judul, drive_id, deskripsi, urutan, is_active } = body;
  const updateData: Record<string, unknown> = {};

  if (judul !== undefined) {
    if (typeof judul !== 'string' || judul.trim().length === 0) {
      return NextResponse.json({ error: 'Judul tidak valid' }, { status: 400 });
    }
    updateData.judul = judul.trim();
  }
  if (drive_id !== undefined) updateData.drive_id = drive_id;
  if (deskripsi !== undefined) updateData.deskripsi = deskripsi || null;
  if (urutan !== undefined) updateData.urutan = urutan;
  if (is_active !== undefined) updateData.is_active = is_active;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('videos')
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
    .from('videos')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
