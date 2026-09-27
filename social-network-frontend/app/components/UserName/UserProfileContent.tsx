// app/user/[username]/components/UserProfileContent.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { FollowListModal } from './FollowListModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { ProfilePostsList } from '@/app/components/UserName/ProfilePostsList';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import { GET_USER_BY_USERNAME } from '@/app/graphql/user.queries';
import { ProfileUser } from './types';
import { useAppSelector } from '@/app/redux/hooks';
import { CreateStoryModal } from '../story/CreateStoryModal';

interface UserProfileContentProps {
    user: ProfileUser;
    avatarUrl: string | null;
}

export const UserProfileContent = ({ user, avatarUrl }: UserProfileContentProps) => {
    const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [followersCount, setFollowersCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);

    const currentUser = useAppSelector(state => state.auth.user);
    const isOwner = currentUser?.id === user.id;

    const { refetch } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username: user.username },
        skip: true,
    });

    const displayedFollowersCount = followersCount ?? user.followersCount;
    const displayedFollowingCount = followingCount ?? user.followingCount;

    const handleFollowChange = () => {
        refetch().then(({ data }) => {
            if (data?.getUserByUsername) {
                setFollowersCount(data.getUserByUsername.followersCount);
                setFollowingCount(data.getUserByUsername.followingCount);
            }
        });
    };

    return (
        <>
            {isOwner && (
                <CreateStoryModal
                    isOpen={isStoryModalOpen}
                    onClose={() => setIsStoryModalOpen(false)}
                    onSuccess={() => setIsStoryModalOpen(false)}
                />
            )}

            {modalType && (
                <FollowListModal
                    userId={user.id}
                    type={modalType}
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onFollowChange={handleFollowChange}
                />
            )}

            {avatarUrl && (
                <ImagePreviewModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    imageUrl={avatarUrl}
                    altText={user.fullName}
                />
            )}

            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-6">
                <ProfileHeader
                    user={user}
                    avatarUrl={avatarUrl}
                    isOwner={isOwner} 
                    displayedFollowersCount={displayedFollowersCount}
                    displayedFollowingCount={displayedFollowingCount}
                    onAvatarClick={() => setIsImageModalOpen(true)}
                    onFollowersClick={() => setModalType('followers')}
                    onFollowingClick={() => setModalType('following')}
                    onFollowChange={(newCount) => setFollowersCount(newCount)}
                    onCreateStory={() => setIsStoryModalOpen(true)}
                />
                <ProfileInfo user={user} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <h1 className="text-lg font-bold text-primary mb-4">
                    پست‌ها
                </h1>
                <ProfilePostsList userId={user.id} />
            </div>
        </>
    );
};