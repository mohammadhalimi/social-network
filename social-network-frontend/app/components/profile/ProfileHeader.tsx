'use client';

import {
    Menu,
    X,
    LogOut
} from 'lucide-react';

interface ProfileHeaderProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (value: boolean) => void;
    handleLogout: () => void;
}

export const ProfileHeader = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
}: ProfileHeaderProps) => (
    <div
        className="
  flex
  items-center
  justify-between
  mb-6
  lg:mb-8
  ">
        <div>
            <h1
                className="
      text-2xl
      lg:text-3xl
      font-bold
      bg-gradient-to-r
      from-primary
      to-secondary
      bg-clip-text
      text-transparent
      ">
                حساب کاربری
            </h1>
            <p
                className="
      text-sm
      text-text-secondary
      hidden sm:block
      ">
                اطلاعات شخصی خود را مدیریت کنید
            </p>
        </div>
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
      lg:hidden
      p-2
      rounded-xl
      bg-white
      shadow-soft
      hover:shadow-medium
      transition-all
      duration-200"
            aria-label="Toggle menu"
        >
            {isMobileMenuOpen ? (
                <X className="
        w-6
        h-6
        text-text-primary"
                />
            ) : (
                <Menu
                    className="
                w-6
                h-6
                text-text-primary"
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
            hover:cursor-pointer"
        >
            <LogOut
                className="
            w-4
            h-4" />
            خروج
        </button>
    </div>
);