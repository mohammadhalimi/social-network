'use client';

import Image from 'next/image';
import { ProfileUser } from './types';
import { Calendar } from 'lucide-react';
import { FollowState } from './FollowButton/constants';
import { StoryViewerModal } from '../story/StoryViewerModal';
import { ProfileAvatar } from './ProfileHeader/ProfileAvatar';
import { useProfileHeader } from './ProfileHeader/useProfileHeader';
import { FollowButton } from '@/app/components/UserName/FollowButton';


interface ProfileHeaderProps {
    user: ProfileUser;
    avatarUrl: string | null;
    isOwner: boolean;
    canViewContent: boolean;
    displayedFollowersCount: number;
    displayedFollowingCount: number;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
    onFollowChange: (status: FollowState, newCount?: number) => void;
    onCreateStory: () => void;
}

export const ProfileHeader = ({
    user,
    avatarUrl,
    isOwner,
    canViewContent,
    displayedFollowersCount,
    displayedFollowingCount,
    onFollowersClick,
    onFollowingClick,
    onFollowChange,
    onCreateStory,
}: ProfileHeaderProps) => {
    const {
        viewerOpen,
        isLongPressing,
        stories,
        hasStories,
        hasUnviewedStory,
        initialIndex,
        refetch,
        handlePressStart,
        handlePressEnd,
        handlePressCancel,
        closeViewer,
    } = useProfileHeader({
        userId: user.id,
        canViewContent,
        avatarUrl
    });

    return (
        <>
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
                <ProfileAvatar
                    avatarUrl={avatarUrl}
                    fullName={user.fullName}
                    isOwner={isOwner}
                    hasStories={hasStories}
                    hasUnviewedStory={hasUnviewedStory}
                    onCreateStory={onCreateStory}
                    onPressStart={handlePressStart}
                    onPressEnd={handlePressEnd}
                    onPressCancel={handlePressCancel}
                />

                <div
                    className="
                    flex-1
                    text-center
                    sm:text-right
                ">
                    <div
                        className="
                        gap-3
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        
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

                        {!isOwner && (
                            <FollowButton
                                key={user.id}
                                userId={user.id}
                                initialIsFollowing={user.isFollowing}
                                initialIsPending={user.isFollowRequestPending}
                                onFollowChange={onFollowChange} 
                            />
                        )}
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
                                {displayedFollowingCount}
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

            {isLongPressing && avatarUrl && (
                <div
                    className="
                    fixed
                    inset-0
                    bg-black/80
                    z-[200]
                    flex
                    items-center
                    justify-center
                    pointer-events-none
                ">
                    <div
                        className="
                        w-72
                        h-72
                        sm:w-96
                        sm:h-96
                        rounded-full
                        overflow-hidden
                        border-4
                        border-white/20
                        animate-in
                        fade-in
                        zoom-in
                        duration-200
                    ">
                        <Image
                            src={avatarUrl}
                            alt={user.fullName}
                            className="
                            w-full
                            h-full
                            object-cover"
                            width={400}
                            height={400}
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {viewerOpen && hasStories && (
                <StoryViewerModal
                    stories={stories}
                    initialIndex={initialIndex}
                    isOwner={isOwner}
                    isOpen={true}
                    onClose={closeViewer}
                    onStoryViewed={() => refetch()}
                />
            )}
        </>
    );
};