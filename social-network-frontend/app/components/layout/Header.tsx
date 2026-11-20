'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Home, Search, LogIn } from 'lucide-react';
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
    const isActive = (path: string) => pathname === path;

    // ✅ تو صفحات Auth هدر نمایش داده نشه
    if (pathname.startsWith('/auth')) return null;

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
            
            {/* سمت راست: دکمه منو موبایل + لوگو */}
            <div
                className="
                flex
                items-center
                gap-3
                ">
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
                        bg-linear-to-r
                        from-primary
                        to-secondary
                        bg-clip-text
                        text-transparent
                        ">
                        پنل کاربری
                    </h1>
                </Link>
            </div>

            {/* سمت چپ: آیکون‌ها (فقط دسکتاپ) و اعلان و آواتار */}
            {user ? (
                <div
                    className="
                    flex
                    items-center
                    gap-2
                    sm:gap-3
                    ">
                    
                    {/* آیکون‌های ناوبری (فقط تو سایز دسکتاپ) */}
                    <div
                        className="
                        hidden
                        lg:flex
                        items-center
                        gap-1
                        mr-4
                        ">
                        <Link
                            href="/"
                            aria-label="خانه"
                            className={`
                            p-2
                            rounded-xl
                            transition-colors
                            ${isActive('/') 
                                ? 'text-primary bg-primary/10' 
                                : 'text-secondary hover:text-primary hover:bg-border/50'
                            }
                            `}
                            title="خانه"
                        >
                            <Home size={22} className={isActive('/') ? 'fill-primary/20' : ''} />
                        </Link>
                        <Link
                            aria-label="جستجو"
                            href="/search"
                            className={`
                            p-2
                            rounded-xl
                            transition-colors
                            ${isActive('/search') 
                                ? 'text-primary bg-primary/10' 
                                : 'text-secondary hover:text-primary hover:bg-border/50'
                            }
                            `}
                            title="جستجو"
                        >
                            <Search size={22} className={isActive('/search') ? 'fill-primary/20' : ''} />
                        </Link>
                    </div>

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
            ) : (
                // ✅ دکمه ورود / ثبت‌نام برای کاربر مهمان
                <Link
                    href="/auth/login"
                    className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    bg-primary
                    text-white
                    text-sm
                    font-medium
                    rounded-xl
                    hover:bg-secondary
                    transition-colors
                    ">
                    <LogIn size={16} />
                    ورود / ثبت‌نام
                </Link>
            )}
        </header>
    );
};