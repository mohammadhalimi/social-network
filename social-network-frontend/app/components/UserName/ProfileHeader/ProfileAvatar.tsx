'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';

interface ProfileAvatarProps {
    avatarUrl: string | null;
    fullName: string;
    isOwner: boolean;
    hasStories: boolean;
    hasUnviewedStory: boolean;
    onCreateStory: () => void;
    onPressStart: () => void;
    onPressEnd: () => void;
    onPressCancel: () => void;
}

export const ProfileAvatar = ({
    avatarUrl,
    fullName,
    isOwner,
    hasStories,
    hasUnviewedStory,
    onCreateStory,
    onPressStart,
    onPressEnd,
    onPressCancel,
}: ProfileAvatarProps) => {
    return (
        <div
            className="
        relative
        mx-auto
        sm:mx-0
        flex-shrink-0
        ">
            <div
                data-testid="avatar-container"
                onMouseDown={onPressStart}
                onMouseUp={onPressEnd}
                onMouseLeave={onPressCancel}
                onTouchStart={onPressStart}
                onTouchEnd={onPressEnd}
                onTouchCancel={onPressCancel}
                className={`
                    w-24
                    h-24
                    sm:w-32
                    sm:h-32
                    rounded-full
                    p-0.5
                    transition-colors
                    select-none
                    ${hasStories
                        ? hasUnviewedStory
                            ? 'bg-gradient-to-tr from-primary to-purple-500 cursor-pointer'
                            : 'bg-border cursor-pointer'
                        : avatarUrl ? 'cursor-pointer' : ''
                    }
                `}
                title={hasStories ? 'کلیک: مشاهده‌ی استوری - نگه‌دارید: مشاهده‌ی عکس' : undefined}
            >
                <div
                    className={`
                w-full
                h-full
                rounded-full
                ${hasStories ? 'bg-card p-0.5' : ''}`}
                >
                    <div
                        className="
                    w-full
                    h-full
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
                                alt={fullName}
                                className="
                                w-full
                                h-full
                                object-cover
                                pointer-events-none"
                                width={128}
                                height={128}
                                unoptimized
                                draggable={false}
                            />
                        ) : (
                            <span
                            className="
                            text-4xl
                            font-bold
                            text-white
                            ">
                                {fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {isOwner && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCreateStory();
                    }}
                    title="افزودن استوری"
                    data-testid="add-story-button"
                    className="
                    absolute
                    bottom-1
                    left-1
                    w-8
                    h-8
                    bg-primary
                    text-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    border-2
                    border-card
                    hover:bg-secondary
                    transition-colors
                    z-10
                    cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            )}
        </div>
    );
};