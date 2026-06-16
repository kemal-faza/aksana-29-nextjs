'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

interface StatCard {
  label: string;
  count: number;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [students, teachers, sambutan, sudut, videos] = await Promise.all([
          apiGet<{ total: number }>('/api/public/students', { limit: '1' }),
          apiGet<{ total: number }>('/api/public/teachers', { limit: '1' }),
          apiGet<{ data: unknown[] }>('/api/public/sambutan'),
          apiGet<{ data: unknown[] }>('/api/public/sudut-sekolah'),
          apiGet<{ data: unknown[] }>('/api/public/videos'),
        ]);

        setStats([
          { label: 'Siswa', count: students.total, color: 'bg-blue-500' },
          { label: 'Guru', count: teachers.total, color: 'bg-green-500' },
          { label: 'Sambutan', count: sambutan.data.length, color: 'bg-purple-500' },
          { label: 'Sudut Sekolah', count: sudut.data.length, color: 'bg-amber-500' },
          { label: 'Video', count: videos.data.length, color: 'bg-rose-500' },
        ]);
      } catch {
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary">Dashboard</h1>
      <p className="mt-1 text-gray-600">Selamat datang di dasbor admin Aksana 29.</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <span className="text-gray-600 text-sm">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-dark mt-2">{stat.count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
