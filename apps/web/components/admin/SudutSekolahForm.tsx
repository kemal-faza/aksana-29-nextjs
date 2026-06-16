'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminPost, adminPatch } from '@/lib/admin-api';

interface FormData {
  image_path: string;
  caption: string;
  urutan: number;
  is_active: boolean;
}

interface FormProps {
  initialData?: Partial<FormData>;
  entityId?: string;
}

export function SudutSekolahForm({ initialData, entityId }: FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    image_path: initialData?.image_path || '',
    caption: initialData?.caption || '',
    urutan: initialData?.urutan || 1,
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (entityId) {
        await adminPatch(`/api/admin/sudut-sekolah/${entityId}`, form);
      } else {
        await adminPost('/api/admin/sudut-sekolah', form);
      }
      router.push('/dashboard/sudut-sekolah');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Path Gambar</label>
        <input
          type="text"
          required
          value={form.image_path}
          onChange={(e) => setForm({ ...form, image_path: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="images/sudut-sekolah/{uuid}/1080.webp"
        />
        <p className="mt-1 text-xs text-gray-400">Path lengkap di Supabase Storage</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
        <input
          type="text"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Keterangan foto (opsional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
          <input
            type="number"
            min={1}
            value={form.urutan}
            onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aktif</label>
          <select
            value={form.is_active ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : entityId ? 'Simpan Perubahan' : 'Tambah Foto'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/sudut-sekolah')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
