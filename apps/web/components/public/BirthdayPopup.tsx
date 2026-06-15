'use client';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface BirthdayPopupProps {
  students: Array<{ id: string; nama: string; kelas: string }>;
}

export function BirthdayPopup({ students }: BirthdayPopupProps) {
  useEffect(() => {
    if (students.length === 0) return;

    Swal.fire({
      title: 'Selamat Ulang Tahun!',
      html: students.length === 1
        ? `<b>${students[0].nama}</b><br/>${students[0].kelas}`
        : students.map(s => `<b>${s.nama}</b> (${s.kelas})`).join('<br/>'),
      icon: 'success',
      confirmButtonColor: '#065f46',
      timer: 5000,
      timerProgressBar: true,
    });
  }, [students]);

  return null;
}
