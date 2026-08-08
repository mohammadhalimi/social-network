'use client';

import { Menu, X, LogOut } from 'lucide-react';
import { User } from '@/app/redux/features/authSlice';

interface ProfileHeaderProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (value: boolean) => void;
    handleLogout: () => void;
    user: User | null;
}

export const ProfileHeader = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
    user
}: ProfileHeaderProps) => (
    <header
        className="
    bg-white
    border-b
    border-gray-200/80
    px-6
    lg:px-8
    py-4
    flex
    items-center
    justify-between
    sticky
    top-0
    z-40
    ">
        <div>
            <h1
                className="
            text-xl
            lg:text-2xl
            font-bold
            bg-gradient-to-r
            from-primary
            to-secondary
            bg-clip-text
            text-transparent
            ">
                پنل کاربری
            </h1>
            <p
                className="
            text-sm
            text-primary
            hidden
            sm:block">
                خوش آمدید {user?.fullName || 'کاربر عزیز'}
            </p>
        </div>
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
            lg:hidden
            p-2
            rounded-xl
            bg-gray-100
            hover:bg-gray-200
            transition-all
            duration-200"
            aria-label="Toggle menu"
        >
            {isMobileMenuOpen ? (
                <X
                    className="
                w-5
                h-5
                text-primary"
                />
            ) : (
                <Menu
                    className="
                w-5
                h-5
                text-primary"
                />
            )}
        </button>
        <button
            onClick={handleLogout}
            className="
            hidden
            lg:flex
            items-center
            gap-2
            text-sm
            text-red-500
            hover:text-red-600
            transition-colors
            font-medium
            px-4
            py-2
            rounded-xl
            hover:bg-red-50
            ">
            <LogOut className="w-4 h-4" />
            خروج
        </button>
    </header>
);