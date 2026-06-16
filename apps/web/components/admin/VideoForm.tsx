'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminPost, adminPatch } from '@/lib/admin-api';

interface VideoFormData {
  judul: string;
  drive_id: string;
  deskripsi: string;
  urutan: number;
  is_active: boolean;
}

interface VideoFormProps {
  initialData?: Partial<VideoFormData>;
  videoId?: string;
}

export function VideoForm({ initialData, videoId }: VideoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<VideoFormData>({
    judul: initialData?.judul || '',
    drive_id: initialData?.drive_id || '',
    deskripsi: initialData?.deskripsi || '',
    urutan: initialData?.urutan || 1,
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (videoId) {
        await adminPatch(`/api/admin/videos/${videoId}`, form);
      } else {
        await adminPost('/api/admin/videos', form);
      }
      router.push('/dashboard/gallery');
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Video</label>
        <input
          type="text"
          required
          value={form.judul}
          onChange={(e) => setForm({ ...form, judul: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Video Angkatan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive ID</label>
        <input
          type="text"
          required
          value={form.drive_id}
          onChange={(e) => setForm({ ...form, drive_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="1a2b3c4d5e6f7g8h9i0j..."
        />
        <p className="mt-1 text-xs text-gray-400">
          ID file Google Drive (dari URL: https://drive.google.com/file/d/<strong>ID</strong>/view)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea
          value={form.deskripsi}
          onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Deskripsi video (opsional)"
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
          {loading ? 'Menyimpan...' : videoId ? 'Simpan Perubahan' : 'Tambah Video'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/gallery')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
