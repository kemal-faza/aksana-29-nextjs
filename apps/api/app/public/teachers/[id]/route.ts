import { getSupabaseAdmin } from '../../../utils/supabase';
import { TeacherPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  const sanitized = TeacherPublicSchema.parse(data);
  return Response.json(sanitized);
}
