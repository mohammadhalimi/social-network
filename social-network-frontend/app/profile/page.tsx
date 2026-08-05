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
    <div
      className="
    min-h-screen
    bg-gradient-to-br
    from-gray-50/80
    via-white
    to-gray-50/60
    ">
      <div
        className="
      max-w-7xl
      mx-auto
      px-4
      sm:px-6
      lg:px-8
      py-6
      lg:py-10
      ">
        <ProfileHeader
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleLogout={handleLogout}
        />
        <div
          className="
        flex
        flex-col
        lg:flex-row
        gap-6
        lg:gap-8
        ">
          <Sidebar
            user={user}
            avatarUrl={avatarUrl}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
          />
          <MobileMenu
            user={user}
            avatarUrl={avatarUrl}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
            isOpen={isMobileMenuOpen}
          />
          <main
            className="
          flex-1
          min-w-0
          ">
            <ProfileContent
              user={user}
              loading={loading}
              activeTab={activeTab}
            />
          </main>
        </div>
      </div>
    </div>
  );
}