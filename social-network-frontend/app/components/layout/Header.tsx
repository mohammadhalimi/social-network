'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getAvatarUrl } from '@/app/lib/utils/avatar';
import { toggleMobileMenu } from '@/app/redux/uiSlice';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { NotificationBell } from '../notification/NotificationBell';



export const Header = () => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
    const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null;

    const showMobileMenuButton = user && pathname === '/profile';

    return (
        <header
            className="
            bg-card
            border-b
            border-border
            px-4
            sm:px-6
            lg:px-8
            py-3
            flex
            items-center
            justify-between
            sticky
            top-0
            z-40
            ">
            <div className="flex items-center gap-3">
                {/* ✅ دکمه منوی موبایل */}
                {showMobileMenuButton && (
                    <button
                        onClick={() => dispatch(toggleMobileMenu())}
                        className="
                        lg:hidden
                        p-2
                        rounded-xl
                        hover:bg-border/50
                        transition-colors
                        cursor-pointer
                        "
                        aria-label="منوی موبایل"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 text-primary" />
                        ) : (
                            <Menu className="w-5 h-5 text-primary" />
                        )}
                    </button>
                )}

                <Link href="/" className="flex items-center gap-2">
                    <h1
                        className="
                        text-lg
                        lg:text-xl
                        font-bold
                        bg-gradient-to-r
                        from-primary
                        to-secondary
                        bg-clip-text
                        text-transparent
                        ">
                        پنل کاربری
                    </h1>
                    <p className="text-sm text-secondary hidden sm:block">
                        خوش آمدید {user?.fullName || 'کاربر عزیز'} 👋
                    </p>
                </Link>
            </div>

            {user && (
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <Link
                        href="/profile"
                        className="
                        w-9
                        h-9
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                        ring-2
                        ring-border
                        hover:ring-primary
                        transition-all
                        ">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                width={40}
                                height={40}
                                unoptimized
                            />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {user.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </Link>
                </div>
            )}
        </header>
    );
};