'use client';

import Image from 'next/image';
import { ProfileUser } from './types';
import { Calendar } from 'lucide-react';
import { FollowButton } from '@/app/components/UserName/FollowButton';

interface ProfileHeaderProps {
    user: ProfileUser;
    avatarUrl: string | null;
    displayedFollowersCount: number;
    onAvatarClick: () => void;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
    onFollowChange: (newCount: number) => void;
}

export const ProfileHeader = ({
    user,
    avatarUrl,
    displayedFollowersCount,
    onAvatarClick,
    onFollowersClick,
    onFollowingClick,
    onFollowChange,
}: ProfileHeaderProps) => {
    return (
        <div
            className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            gap-6
            pb-6
            mb-6
            border-b
            border-border
        ">
            <div
                onClick={() => avatarUrl && onAvatarClick()}
                className={`
                    w-24
                    h-24
                    sm:w-32
                    sm:h-32 
                    rounded-full 
                    bg-gradient-primary 
                    flex
                    items-center
                    justify-center 
                    shadow-glow-primary 
                    overflow-hidden 
                    flex-shrink-0 
                    mx-auto sm:mx-0
                    ${avatarUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
                `}
                title={avatarUrl ? 'برای بزرگنمایی کلیک کنید' : undefined}
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={user.fullName}
                        className="
                        w-full
                        h-full
                        object-cover"
                        width={100}
                        height={100}
                        unoptimized
                    />
                ) : (
                    <span className="
                          text-4xl
                          font-bold
                          text-white
                    ">
                        {user.fullName?.[0] || '👤'}
                    </span>
                )}
            </div>

            <div
                className="
                flex-1
                text-center
                sm:text-right
            ">
                <div
                    className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                ">
                    <div>
                        <h1
                            className="
                            text-2xl
                            font-bold
                            text-primary
                        ">
                            {user.fullName}
                        </h1>
                        <p
                            className="
                            text-secondary
                            text-sm
                        ">
                            @{user.username}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                            mt-2
                            flex
                            items-center
                            justify-center
                            sm:justify-start
                            gap-1.5
                        ">
                            <Calendar
                                className="
                                w-3.5
                                h-3.5
                            "/>
                            عضویت از {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                    </div>

                    <FollowButton
                        userId={user.id}
                        initialIsFollowing={user.isFollowing}
                        onFollowChange={(_, newCount) => onFollowChange(newCount)}
                    />
                </div>
                <div
                    className="
                    flex
                    items-center
                    justify-center
                    sm:justify-start
                    gap-6
                    mt-4
                ">
                    <button
                        onClick={onFollowersClick}
                        className="
                        text-center
                        hover:opacity-80
                        transition-opacity
                        cursor-pointer
                        ">
                        <p
                            className="
                            font-bold
                            text-primary
                        ">
                            {displayedFollowersCount}
                        </p>
                        <p
                            className="
                            text-xs 
                            text-secondary
                        ">
                            دنبال‌کننده
                        </p>
                    </button>
                    <button
                        onClick={onFollowingClick}
                        className="
                        text-center
                        hover:opacity-80
                        transition-opacity
                        cursor-pointer
                        ">
                        <p
                            className="
                            font-bold
                            text-primary
                        ">
                            {user.followingCount}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                        ">
                            دنبال‌شونده
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};