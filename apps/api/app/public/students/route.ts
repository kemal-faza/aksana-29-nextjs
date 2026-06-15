import { getSupabaseAdmin } from '../../utils/supabase';
import { StudentPublicSchema } from '@aksana/shared';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get('kelas');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('students')
    .select('*', { count: 'exact' });

  if (kelas) query = query.eq('kelas', kelas);
  if (search) query = query.ilike('nama', `%${search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('nama');

  const { data, error, count } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const sanitized = data?.map(row => StudentPublicSchema.parse(row)) || [];

  return Response.json({
    data: sanitized,
    total: count,
    page,
    limit,
  });
}
