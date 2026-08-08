'use client';

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

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
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
      {/* هدر */}
      <ProfileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        user={user}
      />

      {/* سایدبار و محتوای اصلی در یک div */}
      <div className="flex flex-1 bg-gray">
        <Sidebar
          user={user}
          avatarUrl={avatarUrl}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 p-6 lg:pt-3 ">
          <ProfileContent
            user={user}
            loading={loading}
            activeTab={activeTab}
          />
        </main>
      </div>

      {/* منوی موبایل */}
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