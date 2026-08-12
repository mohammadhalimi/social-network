'use client';

import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/profile/Sidebar';
import { logout } from '@/app/redux/features/authSlice';
import { MobileMenu } from '../components/profile/MobileMenu';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileContent } from '../components/profile/ProfileContent';


export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      // ✅ ۱. فراخوانی Mutation logout از GraphQL (برای پاک کردن کوکی در بک‌اند)
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ ارسال کوکی
        body: JSON.stringify({
          query: `
            mutation {
              logout {
                success
                message
              }
            }
          `,
        }),
      });

      const result = await response.json();
      
      if (result.data?.logout?.success) {
        // ✅ ۲. پاک کردن توکن از Redux
        dispatch(logout());
        
        // ✅ ۳. پاک کردن کوکی از مرورگر (با تنظیم تاریخ انقضا به گذشته)
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        
        // ✅ ۴. پاک کردن localStorage (اگر چیزی ذخیره شده باشد)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        toast.success('✅ با موفقیت خارج شدید!');
        
        // ✅ ۵. هدایت به صفحه لاگین
        router.push('/auth/login');
      } else {
        toast.error('❌ خطا در خروج از حساب');
      }
    } catch (error) {
      console.error('❌ خطا در خروج:', error);
      toast.error('❌ خطا در خروج از حساب');
    }
  };

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/uploads/')) return `http://localhost:4000${avatar}`;
    return `http://localhost:4000/uploads/${avatar}`;
  };

  const avatarUrl = user ? getAvatarUrl(user.avatar) : null;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <ProfileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        user={user}
      />

      <div className="flex flex-1 bg-gray">
        <Sidebar
          user={user}
          avatarUrl={avatarUrl}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 p-6 lg:pt-3">
          <ProfileContent
            user={user}
            loading={loading}
            activeTab={activeTab}
          />
        </main>
      </div>

      <MobileMenu
        user={user}
        avatarUrl={avatarUrl}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        isOpen={isMobileMenuOpen}
      />
    </div>
  );
}