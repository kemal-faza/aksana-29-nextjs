import { getSupabaseAdmin } from '../../../utils/supabase';
import { StudentPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  const sanitized = StudentPublicSchema.parse(data);
  return Response.json(sanitized);
}
