'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { adminGet, adminPost, adminDelete } from '@/lib/admin-api';

interface Admin {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet<{ data: Admin[] }>('/api/admin/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await adminPost('/api/admin/admins', { email });
      setSuccess(`Admin ${email} berhasil ditambahkan`);
      setEmail('');
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string, adminEmail: string) => {
    if (!confirm(`Yakin ingin menghapus admin ${adminEmail}?`)) return;
    setError('');
    setSuccess('');

    try {
      await adminDelete(`/api/admin/admins/${id}`);
      setSuccess(`Admin ${adminEmail} berhasil dihapus`);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus admin');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Manajemen Admin</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Add admin form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark mb-4">Tambah Admin Baru</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {submitting ? '...' : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Admin list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-dark">Daftar Admin Aktif</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data...</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada admin</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {admins.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{admin.email}</p>
                  <p className="text-xs text-gray-500">
                    Ditambahkan {new Date(admin.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(admin.id, admin.email)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
