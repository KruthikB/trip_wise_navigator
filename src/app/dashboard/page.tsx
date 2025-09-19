
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if(user) {
        // If user is logged in, but somehow on this page, redirect to home.
        router.replace('/');
      } else {
        // If user is not logged in, redirect to login.
        router.replace('/login?redirect=/');
      }
    }
  }, [user, loading, router]);

  return null;
}
