'use client';

import { useState } from 'react';
import { ProfileUser } from './types';
import { ProfileInfo } from './ProfileInfo';
import { ProfileHeader } from './ProfileHeader';
import { FollowListModal } from '@/app/components/UserName/FollowListModal';
import { ProfilePostsList } from '@/app/components/UserName/ProfilePostsList';
import { ImagePreviewModal } from '@/app/components/UserName/ImagePreviewModal';

interface UserProfileContentProps {
    user: ProfileUser;
    avatarUrl: string | null;
}

export const UserProfileContent = ({ user, avatarUrl }: UserProfileContentProps) => {
    const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [followersCount, setFollowersCount] = useState<number | null>(null);

    const displayedFollowersCount = followersCount ?? user.followersCount;

    return (
        <>
            {/* مودال لیست فالوور/فالووینگ */}
            {modalType && (
                <FollowListModal
                    userId={user.id}
                    type={modalType}
                    isOpen={true}
                    onClose={() => setModalType(null)}
                />
            )}

            {/* مودال نمایش عکس */}
            {avatarUrl && (
                <ImagePreviewModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    imageUrl={avatarUrl}
                    altText={user.fullName}
                />
            )}

            {/* کارت اصلی پروفایل */}
            <div
                className="
                bg-card
                border
                border-border
                rounded-2xl
                p-6
                shadow-soft
                mb-6
            ">
                <ProfileHeader
                    user={user}
                    avatarUrl={avatarUrl}
                    displayedFollowersCount={displayedFollowersCount}
                    onAvatarClick={() => setIsImageModalOpen(true)}
                    onFollowersClick={() => setModalType('followers')}
                    onFollowingClick={() => setModalType('following')}
                    onFollowChange={(newCount) => setFollowersCount(newCount)}
                />
                <ProfileInfo user={user} />
            </div>

            {/* لیست پست‌ها */}
            <div
                className="
                bg-card
                border
                border-border
                rounded-2xl
                p-6
                shadow-soft
            ">
                <h1
                    className="
                    text-lg
                    font-bold
                    text-primary
                    mb-4
                ">
                    پست‌ها
                </h1>
                <ProfilePostsList
                    userId={user.id}
                />
            </div>
        </>
    );
};