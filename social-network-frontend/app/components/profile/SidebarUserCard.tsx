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
  items-center
  gap-4
  pb-5
  mb-4
  border-b
  border-gray-100
  ">
        <div
            className="
    w-14
    h-14
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
                    width={56}
                    height={56}
                    unoptimized
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <span
                className={`
      text-xl
      font-bold
      text-white
      ${avatarUrl ? 'hidden' : ''} fallback`}>
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
      text-text-primary
      text-sm truncate
      ">
                {user?.fullName || 'کاربر مهمان'}
            </p>
            <p
                className="
      text-xs
      text-text-secondary
      truncate
      ">
                @{user?.username || '—'}
            </p>
        </div>
    </div>
);