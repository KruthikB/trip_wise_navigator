
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/');
    }
  }, [user, loading, router]);

  // The actual dashboard content is now on the main page.
  // This layout can be simplified or removed if it's no longer needed.
  // For now, it just acts as a guard.
  if (loading || !user) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
