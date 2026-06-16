'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminPost, adminPatch } from '@/lib/admin-api';

interface SambutanFormData {
  nama: string;
  jabatan: string;
  isi: string;
  image_path: string;
  urutan: number;
  is_active: boolean;
}

interface SambutanFormProps {
  initialData?: Partial<SambutanFormData>;
  sambutanId?: string;
}

export function SambutanForm({ initialData, sambutanId }: SambutanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<SambutanFormData>({
    nama: initialData?.nama || '',
    jabatan: initialData?.jabatan || '',
    isi: initialData?.isi || '',
    image_path: initialData?.image_path || '',
    urutan: initialData?.urutan || 1,
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (sambutanId) {
        await adminPatch(`/api/admin/sambutan/${sambutanId}`, form);
      } else {
        await adminPost('/api/admin/sambutan', form);
      }
      router.push('/dashboard/sambutan');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nama pejabat"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
          <input
            type="text"
            required
            value={form.jabatan}
            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Kepala Madrasah"
          />
        </div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Isi Sambutan</label>
        <textarea
          required
          value={form.isi}
          onChange={(e) => setForm({ ...form, isi: e.target.value })}
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Teks sambutan..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : sambutanId ? 'Simpan Perubahan' : 'Tambah Sambutan'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/sambutan')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
