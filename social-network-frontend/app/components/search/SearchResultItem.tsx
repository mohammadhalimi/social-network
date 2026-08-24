'use client';

import Link from 'next/link';
import Image from 'next/image';

interface SearchResultItemProps {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    onClick: () => void;
    getAvatarUrl: (avatar: string | null) => string | null;
}

export const SearchResultItem = ({
    id,
    username,
    fullName,
    avatar,
    onClick,
    getAvatarUrl,
}: SearchResultItemProps) => {
    const avatarUrl = getAvatarUrl(avatar);

    return (
        <Link
            href={`/${username}`}
            onClick={onClick}
            className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-primary/5
            transition-colors
      ">
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
            ">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={fullName}
                        className="
                        w-full
                        h-full
                        object-cover"
                        width={100}
                        height={100}
                        unoptimized
                    />
                ) : (
                    <span
                        className="
                        text-white
                        font-bold
                        text-sm
                    ">
                        {fullName?.[0] || '👤'}
                    </span>
                )}
            </div>
            <div
                className="
                min-w-0
                flex-1
            ">
                <p
                    className="
                    font-medium
                    text-primary
                    text-sm
                    truncate
                ">
                    {fullName}
                </p>
                <p
                    className="
                    text-xs
                    text-secondary
                    truncate
                ">
                    @{username}
                </p>
            </div>
        </Link>
    );
};