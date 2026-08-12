'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/redux/hooks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // ✅ اگر کاربر لاگین نباشد و بارگذاری تمام شده باشد، به لاگین هدایت کن
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // ✅ در حال بارگذاری
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // ✅ اگر لاگین نباشد، چیزی نمایش نده (تا هدایت شود)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}