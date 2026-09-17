// components/common/FollowListModal/UserListItem.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FollowUser } from './types';
import { FollowButton } from '../FollowButton';

interface UserListItemProps {
    user: FollowUser;
    onClose: () => void;
}

export const UserListItem = React.memo(({ user, onClose }: UserListItemProps) => {
    return (
        <div
            className="
            flex
            items-center
            gap-3
            p-2
            rounded-xl
            hover:bg-border/50
            transition-colors
        ">
            {/* ✅ فقط یک Link برای عکس + نام + یوزرنیم */}
            <Link
                href={`/${user.username}`}
                onClick={onClose}
                className="
                flex
                items-center
                gap-3
                flex-1
                min-w-0
                group
            ">
                {/* عکس */}
                <div
                    className="
                    w-10
                    h-10
                    rounded-full
                    bg-gradient-primary
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    flex-shrink-0
                    group-hover:opacity-90
                    transition-opacity
                ">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={user.fullName}
                            className="
                            w-full
                            h-full
                            object-cover"
                            width={40}
                            height={40}
                            unoptimized
                        />
                    ) : (
                        <span
                            className="
                            text-white
                            font-bold
                        ">
                            {user.fullName?.[0] || '👤'}
                        </span>
                    )}
                </div>

                {/* نام و یوزرنیم */}
                <div className="flex-1 min-w-0">
                    <p
                        className="
                        truncate
                        text-sm
                        font-medium
                        text-primary
                        group-hover:text-primary
                    ">
                        {user.fullName}
                    </p>
                    <p
                        className="
                        text-xs
                        text-secondary
                        truncate
                    ">
                        @{user.username}
                    </p>
                </div>
            </Link>

            {/* ✅ FollowButton خارج از Link است تا کلیک روی آن به پروفایل نرود */}
            <FollowButton
                userId={user.id}
                initialIsFollowing={user.isFollowing}
            />
        </div>
    );
});

UserListItem.displayName = 'UserListItem';