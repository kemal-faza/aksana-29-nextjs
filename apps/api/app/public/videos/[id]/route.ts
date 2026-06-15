import { getSupabaseAdmin } from '../../../utils/supabase';
import { VideoPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  const sanitized = VideoPublicSchema.parse(data);
  return Response.json(sanitized);
}
