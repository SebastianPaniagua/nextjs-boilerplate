'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'
import QrCodeReader from '@/components/qr-code-reader';


export default function QrCodeReaderPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <QrCodeReader />
    </div>
  );
}
