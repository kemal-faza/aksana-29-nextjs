import { getSupabaseAdmin } from '../../../utils/supabase';
import { SudutSekolahPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sudut_sekolah')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  const sanitized = SudutSekolahPublicSchema.parse(data);
  return Response.json(sanitized);
}
