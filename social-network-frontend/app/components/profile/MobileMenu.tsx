'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Settings, Lock, LogOut } from 'lucide-react';

const menuItems = [
    { id: 'profile', label: 'اطلاعات کاربری', icon: User },
    { id: 'edit', label: 'ویرایش اطلاعات', icon: Settings },
    { id: 'change-password', label: 'تغییر رمز عبور', icon: Lock },
];

interface MobileMenuProps {
    user: any;
    avatarUrl: string | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
    isOpen: boolean;
}

export const MobileMenu = ({
    user,
    avatarUrl,
    activeTab,
    setActiveTab,
    handleLogout,
    isOpen,
}: MobileMenuProps) => {
    const isActive = (id: string) => activeTab === id;

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="
            lg:hidden
            fixed
            inset-x-4
            top-20
            z-50
            ">
            <div
                className="
                bg-card
                rounded-2xl
                shadow-xl
                border
                border-border
                p-5
                ">
                <div
                    className="
                    flex
                    items-center
                    gap-4
                    pb-4
                    mb-3
                    border-b
                    border-border
                    ">
                    <div
                        className="
                        w-12
                        h-12
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        shadow-glow-primary
                        flex-shrink-0
                        overflow-hidden
                        ">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="آواتار"
                                className="
                                w-full
                                h-full
                                object-cover"
                                width={48}
                                height={48}
                                unoptimized
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                                }}
                            />
                        ) : null}
                        <span
                            className={`
                            text-lg
                            font-bold
                            text-white ${avatarUrl ? 'hidden' : ''} fallback`}
                        >
                            {user?.fullName?.[0] || '👤'}
                        </span>
                    </div>
                    <div
                        className="
                        min-w-0
                        flex-1
                    ">
                        <p
                            className="
                            font-semibold
                            text-primary
                            text-sm
                            truncate
                        ">
                            {user?.fullName || 'کاربر مهمان'}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                            truncate
                        ">
                            @{user?.username || '—'}
                        </p>
                    </div>
                </div>

                <nav
                    className="
                    space-y-1
                ">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    rounded-xl
                                    text-sm
                                    transition-all
                                    duration-200
                                    text-right
                                    ${active
                                        ? 'bg-gradient-primary text-primary shadow-glow-primary'
                                        : 'text-secondary hover:bg-primary/5 hover:text-primary'
                                    }
                                `}
                            >
                                <Icon
                                    className={`
                                    w-5
                                    h-5
                                    ${active ? 'text-primary' : 'text-secondary'}`}
                                />
                                <span
                                    className="
                                    font-medium
                                ">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                        text-red-500
                        hover:bg-red-50
                        transition-all
                        duration-200
                        mt-2
                        border-t
                        border-border
                        pt-4
                        ">
                        <LogOut
                            className="
                            w-5
                            h-5
                        "/>
                        <span
                            className="
                            font-medium
                        ">خروج از حساب
                        </span>
                    </button>
                </nav>
            </div>
        </motion.div>
    );
};