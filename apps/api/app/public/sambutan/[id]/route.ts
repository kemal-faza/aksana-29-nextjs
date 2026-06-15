import { getSupabaseAdmin } from '../../../utils/supabase';
import { SambutanPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sambutan')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  const sanitized = SambutanPublicSchema.parse(data);
  return Response.json(sanitized);
}
