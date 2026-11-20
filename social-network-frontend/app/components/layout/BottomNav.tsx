'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getAvatarUrl } from '@/app/lib/utils/avatar';
import { useAppSelector } from '@/app/redux/hooks';
import { useNotifications } from '@/app/hooks/useNotifications';

export const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const { unreadCount } = useNotifications();
    const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null;

    const isActive = (path: string) => pathname === path;

    // ✅ تو صفحات Auth نوار پایین نمایش داده نشه
    if (pathname.startsWith('/auth')) return null;

    // ✅ اگر کاربر لاگین نکرده، نوار پایین نمایش داده نشه (چون صفحاتی برای رفتن نداره)
    if (!user) return null;

    return (
        <nav
            className="
            lg:hidden
            fixed
            bottom-0
            inset-x-0
            bg-card
            border-t
            border-border
            z-50
            pb-safe
            ">
            <div
                className="
                flex
                items-center
                justify-around
                h-16
                ">
                {/* خانه */}
                <Link
                    href="/"
                    aria-label="خانه"
                    className={`
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-full
                    h-full
                    space-y-1
                    transition-colors
                    ${isActive('/') 
                        ? 'text-primary' 
                        : 'text-secondary hover:text-primary'
                    }
                    `}
                >
                    <Home size={24} className={isActive('/') ? 'fill-primary/20' : ''} />
                    <span className="text-[10px] font-medium">خانه</span>
                </Link>

                {/* جستجو */}
                <Link
                    href="/search"
                    aria-label="جستجو"
                    className={`
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-full
                    h-full
                    space-y-1
                    transition-colors
                    ${isActive('/search') 
                        ? 'text-primary' 
                        : 'text-secondary hover:text-primary'
                    }
                    `}
                >
                    <Search size={24} className={isActive('/search') ? 'fill-primary/20' : ''} />
                    <span className="text-[10px] font-medium">جستجو</span>
                </Link>

                {/* اعلان‌ها */}
                <Link
                    href="/notifications"
                    aria-label="اعلان‌ها"
                    className={`
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-full
                    h-full
                    space-y-1
                    transition-colors
                    ${isActive('/notifications') 
                        ? 'text-primary' 
                        : 'text-secondary hover:text-primary'
                    }
                    `}
                >
                    <div className="relative">
                        <Bell size={24} className={isActive('/notifications') ? 'fill-primary/20' : ''} />
                        {/* نشانگر تعداد اعلان‌های خوانده‌نشده */}
                        {unreadCount > 0 && (
                            <span
                                className="
                                absolute
                                -top-1
                                -right-1
                                w-4
                                h-4
                                bg-red-500
                                text-white
                                text-[10px]
                                rounded-full
                                flex
                                items-center
                                justify-center
                                "
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">اعلان‌ها</span>
                </Link>

                {/* آواتار / پروفایل */}
                <Link
                    href="/profile"
                    aria-label="پروفایل"
                    className={`
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    w-full
                    h-full
                    space-y-1
                    transition-colors
                    ${isActive('/profile') 
                        ? 'text-primary' 
                        : 'text-secondary hover:text-primary'
                    }
                    `}
                >
                    <div
                        className={`
                        w-6
                        h-6
                        rounded-full
                        overflow-hidden
                        ${isActive('/profile') ? 'ring-2 ring-primary' : 'ring-2 ring-transparent'}
                        `}
                    >
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                width={24}
                                height={24}
                                unoptimized
                            />
                        ) : (
                            <span
                                className="
                                w-full
                                h-full
                                bg-gradient-primary
                                text-white
                                text-xs
                                flex
                                items-center
                                justify-center
                                "
                            >
                                {user.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">پروفایل</span>
                </Link>
            </div>
        </nav>
    );
};