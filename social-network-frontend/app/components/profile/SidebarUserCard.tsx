// components/profile/SidebarUserCard.tsx
'use client';

import Image from 'next/image';
import {
    User
} from '@/app/redux/features/authSlice';
import {
    CirclePlus,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
interface SidebarUserCardProps {
    user: User;
    avatarUrl: string | null;
    onOpenStoryModal: () => void;
}

export const SidebarUserCard = ({ user, avatarUrl, onOpenStoryModal }: SidebarUserCardProps) => (
    <div className="flex flex-col items-center gap-2 pb-6 mb-4 border-b border-border">
        {/* ✅ این div جدید، لنگرگاه دکمه‌ی + میشه */}
        <div className="relative">
            <div
                className="
                w-20
                h-20
                rounded-full
                bg-gradient-primary
                flex
                items-center
                justify-center
                shadow-glow-primary
                overflow-hidden
                ">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="آواتار"
                        className="w-full h-full object-cover"
                        width={120}
                        height={120}
                        unoptimized
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <span
                    className={`
                    text-3xl
                    font-bold
                    text-white
                ${avatarUrl ? 'hidden' : ''} fallback`}
                >
                    {user?.fullName?.[0] || '👤'}
                </span>
            </div>

            {/* ✅ حالا دکمه بیرون از overflow-hidden آواتار هست، ولی داخل relative جدید */}
            <button
                onClick={onOpenStoryModal}
                title="افزودن استوری"
                className="
                absolute
                bottom-0
                left-0
                w-7
                h-7
                bg-primary
                text-white
                rounded-full
                flex
                items-center
                justify-center
                border-2
                border-card
                hover:bg-primary-dark
                transition-colors
                z-10
                "
            >
                <CirclePlus size={16} />
            </button>
        </div>

        <div className="text-center">
            <p className="font-semibold text-primary text-sm truncate max-w-[140px]">
                {user?.fullName || 'کاربر مهمان'}
            </p>
            <p className="text-xs text-secondary truncate max-w-[140px]">
                @{user?.username || '—'}
            </p>
            {user?.username && (
                <Link
                    href={`/${user.username}`}
                    className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-primary hover:underline cursor-pointer"
                >
                    <ExternalLink size={10} />
                    مشاهده‌ی پروفایل عمومی
                </Link>
            )}
        </div>
    </div>
);