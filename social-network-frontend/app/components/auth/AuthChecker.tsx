'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROFILE, GetProfileResponse } from '@/app/graphql/profile.queries';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { loginSuccess, logout } from '@/app/redux/features/authSlice';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthChecker() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAppSelector((state) => state.auth);
  const hasChecked = useRef(false);

  const { data, loading, error } = useQuery<GetProfileResponse>(GET_PROFILE, {
    fetchPolicy: 'network-only',
    // ✅ دیگه skip نمی‌کنیم؛ کوکی httpOnly خودش با درخواست می‌ره
  });

  useEffect(() => {
    if (loading) return;
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (data?.me) {
      // ✅ کوکی معتبر بود -> کاربر لاگین است
      dispatch(loginSuccess({
        user: data.me,
        token: token || '',
      }));
    } else {
      // ❌ کوکی نبود یا نامعتبر بود -> logout و پاک‌سازی state
      dispatch(logout());
      if (pathname?.startsWith('/profile')) {
        router.push('/auth/login');
      }
    }
  }, [data, loading, error, dispatch, router, pathname, token]);

  return null;
}