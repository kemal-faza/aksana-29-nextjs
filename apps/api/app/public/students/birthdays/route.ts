import { getSupabaseAdmin } from '../../../utils/supabase';

export const runtime = 'nodejs';

interface BirthdayRow {
  id: string;
  nama: string;
  kelas: string;
  image_path: string | null;
  ttl: string | null;
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('students')
    .select('id, nama, kelas, image_path, ttl')
    .not('ttl', 'is', null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as unknown as BirthdayRow[];
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const today = rows.filter(s => {
    if (!s.ttl) return false;
    const d = new Date(s.ttl);
    return d.getUTCMonth() + 1 === todayMonth && d.getUTCDate() === todayDay;
  }).map(s => ({
    id: s.id,
    nama: s.nama,
    kelas: s.kelas,
    image_path: s.image_path,
  }));

  const thisMonth = rows.filter(s => {
    if (!s.ttl) return false;
    const d = new Date(s.ttl);
    return d.getUTCMonth() + 1 === todayMonth;
  }).map(s => ({
    id: s.id,
    nama: s.nama,
    kelas: s.kelas,
    image_path: s.image_path,
    tanggal: new Date(s.ttl!).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
    }),
  }));

  return Response.json({ today, thisMonth });
}
