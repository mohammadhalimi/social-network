// app/profile/page.tsx

'use client';

import { useAppSelector } from '@/app/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ✅ پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-teal-50">
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-accent1/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/20 to-accent2/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* ✅ کارت پروفایل */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card shadow-xl">
          {/* ✅ آواتار */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <span className="text-4xl font-bold text-white">
                {user.fullName?.[0] || '👤'}
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary">{user.fullName}</h2>
            <p className="text-text-secondary">@{user.username}</p>
          </div>

          {/* ✅ اطلاعات کاربر */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-text-secondary">ایمیل</span>
              <span className="text-text-primary font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-text-secondary">نام کاربری</span>
              <span className="text-text-primary font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-text-secondary">نام کامل</span>
              <span className="text-text-primary font-medium">{user.fullName}</span>
            </div>
          </div>

          {/* ✅ دکمه بازگشت */}
          <div className="mt-8">
            <Link
              href="/"
              className="btn-secondary w-full text-center block"
            >
              بازگشت به خانه 🏠
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}