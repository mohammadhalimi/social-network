// components/profile/MobileMenu.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    Lock,
    LogOut,
    LayoutGrid,
    PenSquare,
    Cog,
    CirclePlus,
    ExternalLink,
} from 'lucide-react';

const menuItems = [
    { id: 'profile', label: 'اطلاعات کاربری', icon: User },
    { id: 'edit', label: 'ویرایش اطلاعات', icon: Settings },
    { id: 'posts', label: 'پست‌های من', icon: LayoutGrid },
    { id: 'create-post', label: 'نوشتن پست جدید', icon: PenSquare },
    { id: 'change-password', label: 'تغییر رمز عبور', icon: Lock },
    { id: 'settings', label: 'تنظیمات', icon: Cog },
];

interface MobileMenuProps {
    user: any;
    avatarUrl: string | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
    isOpen: boolean;
    onOpenStoryModal: () => void; // ✅ اضافه شد
}

export const MobileMenu = ({
    user,
    avatarUrl,
    activeTab,
    setActiveTab,
    handleLogout,
    isOpen,
    onOpenStoryModal, // ✅ اضافه شد
}: MobileMenuProps) => {
    const isActive = (id: string) => activeTab === id;

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-4 top-20 z-50"
        >
            <div className="bg-card rounded-2xl shadow-xl border border-border p-5">
                <div className="flex items-center gap-4 pb-4 mb-3 border-b border-border">
                    {/* ✅ آواتار با دکمه‌ی + */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-primary overflow-hidden">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="آواتار"
                                    className="w-full h-full object-cover"
                                    width={48}
                                    height={48}
                                    unoptimized
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <span className={`text-lg font-bold text-white ${avatarUrl ? 'hidden' : ''} fallback`}>
                                {user?.fullName?.[0] || '👤'}
                            </span>
                        </div>
                        <button
                            onClick={onOpenStoryModal}
                            title="افزودن استوری"
                            className="absolute -bottom-1 -left-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-card"
                        >
                            <CirclePlus size={12} />
                        </button>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary text-sm truncate">
                            {user?.fullName || 'کاربر مهمان'}
                        </p>
                        <p className="text-xs text-secondary truncate">
                            @{user?.username || '—'}
                        </p>

                        {/* ✅ لینک پروفایل عمومی */}
                        {user?.username && (
                            <Link
                                href={`/${user.username}`}
                                className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-primary hover:underline"
                            >
                                <ExternalLink size={10} />
                                مشاهده‌ی پروفایل عمومی
                            </Link>
                        )}
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-right
                                    ${active
                                        ? 'bg-gradient-primary text-primary shadow-glow-primary'
                                        : 'text-secondary hover:bg-primary/5 hover:text-primary'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-secondary'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all duration-200 mt-2 border-t border-border pt-4"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">خروج از حساب</span>
                    </button>
                </nav>
            </div>
        </motion.div>
    );
};