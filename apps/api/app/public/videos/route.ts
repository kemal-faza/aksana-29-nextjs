import { getSupabaseAdmin } from '../../utils/supabase';
import { VideoPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { data, error, count } = await supabase
    .from('videos')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('urutan');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const sanitized = data?.map(row => VideoPublicSchema.parse(row)) || [];

  return Response.json({
    data: sanitized,
    total: count,
  });
}
