import { getSupabaseAdmin } from '../../utils/supabase';

import { SudutSekolahPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sudut_sekolah')
    .select('*')
    .eq('is_active', true)
    .order('urutan');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const sanitized = data?.map(row => SudutSekolahPublicSchema.parse(row)) || [];
  return Response.json({ data: sanitized });
}
