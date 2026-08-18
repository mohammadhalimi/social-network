'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/redux/hooks';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // ✅ اگر کاربر لاگین است و بارگذاری تمام شده، به پروفایل هدایت کن
        if (!loading && isAuthenticated) {
            router.push('/profile');
        }
    }, [isAuthenticated, loading, router]);

    // ✅ در حال بارگذاری
    if (loading) {
        return (
            <div
                className="
                min-h-screen
                flex
                items-center
                justify-center
            ">
                <div
                    className="
                    text-center
                ">
                    <div
                        className="
                        w-12
                        h-12
                        border-4
                        border-primary
                        border-t-transparent
                        rounded-full
                        animate-spin
                        mx-auto
                    "/>
                    <p
                        className="
                        mt-4
                        text-secondary
                    ">در حال بارگذاری...
                    </p>
                </div>
            </div>
        );
    }

    // ✅ اگر لاگین نباشد، کودکان را نمایش بده
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // ✅ اگر لاگین است، چیزی نمایش نده (تا هدایت شود)
    return null;
}