'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const ok = isAuthenticated();
    router.replace(ok ? '/dashboard' : '/login');
  }, [isAuthenticated, router]);

  return null;
}
