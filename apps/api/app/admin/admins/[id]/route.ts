import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../utils/supabase';
import { getAdminSession } from '../../../utils/admin-guard';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(request);
  if (session instanceof NextResponse) return session;

  const supabase = getSupabaseAdmin();

  // Last-admin protection: check if this is the last active admin
  const { count, error: countError } = await supabase
    .from('allowed_admins')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count !== null && count <= 1) {
    return NextResponse.json(
      { error: 'Tidak dapat menghapus admin terakhir' },
      { status: 409 }
    );
  }

  // Soft delete: set is_active = false
  const { data: admin } = await supabase
    .from('allowed_admins')
    .select('email')
    .eq('id', params.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('allowed_admins')
    // @ts-expect-error - Supabase type inference needs generated types
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deactivated_by: session.userId,
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
