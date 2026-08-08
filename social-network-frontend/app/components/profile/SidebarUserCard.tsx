'use client';

import Image from 'next/image';
import { User } from '@/app/redux/features/authSlice';

interface SidebarUserCardProps {
    user: User;
    avatarUrl: string | null;
}

export const SidebarUserCard = ({ user, avatarUrl }: SidebarUserCardProps) => (
    <div
        className="
    flex
    flex-col
    items-center
    gap-2
    pb-6 
    mb-4
    border-b
    border-white/10
    ">
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
                    className="
                    w-full
                    h-full
                    object-cover"
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
                    text-primary
                    ${avatarUrl ? 'hidden' : ''} fallback`}
            >
                {user?.fullName?.[0] || '👤'}
            </span>
        </div>
        <div className="text-center">
            <p
                className="
            font-semibold
            text-primary
            text-sm
            truncate
            max-w-[140px]">
                {user?.fullName || 'کاربر مهمان'}
            </p>
            <p
                className="
            text-xs
            text-primary
            truncate
            max-w-[140px]
            ">
                {user?.username || '—'}@
            </p>
        </div>
    </div>
);