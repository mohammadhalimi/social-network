'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLogout } from '../hooks/useLogout'; 
import { getAvatarUrl } from '../lib/utils/avatar';
import { setIsMobileMenuOpen } from '../redux/uiSlice';
import { Sidebar } from '../components/profile/Sidebar';
import { MobileMenu } from '../components/profile/MobileMenu';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { ProfileContent } from '../components/profile/ProfileContent';
import { CreateStoryModal } from '../components/story/CreateStoryModal';


export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);
    const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
    
    const [activeTab, setActiveTab] = useState('profile');
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    
    const { handleLogout } = useLogout(); // ✅ استفاده از هوک

    const avatarUrl = user ? getAvatarUrl(user.avatar) : null;

    // ✅ ۱. تابع یکپارچه برای تغییر تب
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        dispatch(setIsMobileMenuOpen(false)); // همیشه منو رو می‌بنده (برای سایدبار هم ضرری نداره)
    };

    // ✅ ۲. تابع یکپارچه برای باز کردن استوری
    const handleOpenStory = () => {
        setIsStoryModalOpen(true);
        dispatch(setIsMobileMenuOpen(false));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <div className="flex flex-1 bg-gray">
                <Sidebar
                    user={user}
                    avatarUrl={avatarUrl}
                    activeTab={activeTab}
                    setActiveTab={handleTabChange} // ✅ تابع جدید
                    handleLogout={handleLogout}
                    onOpenStoryModal={handleOpenStory} // ✅ تابع جدید
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
                setActiveTab={handleTabChange} // ✅ تابع جدید
                handleLogout={handleLogout}
                isOpen={isMobileMenuOpen}
                onOpenStoryModal={handleOpenStory} // ✅ تابع جدید
            />

            <CreateStoryModal
                isOpen={isStoryModalOpen}
                onClose={() => setIsStoryModalOpen(false)}
                onSuccess={() => toast.success('استوری شما فعال شد!')}
            />
        </div>
    );
}