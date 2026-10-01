// components/story/CloseFriendsSelector/FollowerListItem.tsx
'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';

interface FollowerListItemProps {
    follower: {
        id: string;
        fullName: string;
        username: string;
        avatar: string | null;
    };
    isSelected: boolean;
    onToggle: (id: string) => void;
}

export const FollowerListItem = ({ follower, isSelected, onToggle }: FollowerListItemProps) => (
    <button
        type="button"
        onClick={() => onToggle(follower.id)}
        className={`
            w-full
            flex
            items-center
            gap-3
            p-2
            rounded-lg
            transition-colors
            text-right
            ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-border/30'}
        `}
    >
        <div
            className="
            w-9
            h-9
            rounded-full
            bg-gradient-primary
            flex
            items-center
            justify-center
            overflow-hidden
            flex-shrink-0
        ">
            {follower.avatar ? (
                <Image
                    src={follower.avatar}
                    alt={follower.fullName}
                    className="
                    w-full
                    h-full
                    object-cover"
                    width={36}
                    height={36}
                    unoptimized
                />
            ) : (
                <span
                    className="
                    text-white
                    font-bold
                    text-xs
                ">
                    {follower.fullName?.[0] || '👤'}
                </span>
            )}
        </div>
        <div
            className="
            flex-1
            min-w-0
        ">
            <p
                className="
                text-sm
                font-medium
                text-primary
                truncate
            ">
                {follower.fullName}
            </p>
            <p
                className="
                text-xs
                text-secondary
                truncate
            ">
                @{follower.username}
            </p>
        </div>
        <div
            className={`
                w-6
                h-6
                rounded-full
                flex
                items-center
                justify-center
                flex-shrink-0
                transition-colors
                ${isSelected ? 'bg-primary text-white' : 'border-2 border-border'}
            `}
        >
            {isSelected && <Check size={14} />}
        </div>
    </button>
);