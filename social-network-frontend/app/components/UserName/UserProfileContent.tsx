'use client';

import { useEffect, useState } from 'react';
import { ProfileUser } from './types';
import { ProfileInfo } from './ProfileInfo';
import { useQuery } from '@apollo/client/react';
import { ProfileHeader } from './ProfileHeader';
import { useAppSelector } from '@/app/redux/hooks';
import { FollowListModal } from './FollowListModal';
import { FollowState } from './FollowButton/constants';
import { ImagePreviewModal } from './ImagePreviewModal';
import { CreateStoryModal } from '../story/CreateStoryModal';
import { PrivateProfileMessage } from './PrivateProfileMessage';
import { GET_USER_BY_USERNAME } from '@/app/graphql/user.queries';
import { ProfilePostsList } from '@/app/components/UserName/ProfilePostsList';

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
    const [followStatus, setFollowStatus] = useState<FollowState>(
        user.isFollowRequestPending ? 'pending' : user.isFollowing ? 'following' : 'not-following'
    );
    const currentUser = useAppSelector(state => state.auth.user);
    const isOwner = currentUser?.id === user.id;

    const canViewContent =
        isOwner ||
        !user.isPrivate ||
        user.isFollowing;

    const { refetch } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username: user.username },
        skip: true,
    });

    const displayedFollowersCount = followersCount ?? user.followersCount;
    const displayedFollowingCount = followingCount ?? user.followingCount;

    useEffect(() => {
        setFollowStatus(user.isFollowRequestPending ? 'pending' : user.isFollowing ? 'following' : 'not-following');
        setFollowersCount(null);
        setFollowingCount(null);
    }, [user.id]);

    // ✅ استفاده از state
    const isFollowing = followStatus === 'following';
    const isFollowRequestPending = followStatus === 'pending';

    // ✅ این تابع دیگه refetch نمی‌خواد! فقط state رو عوض می‌کنه.
    const handleFollowChange = (status: FollowState, newCount?: number) => {
        setFollowStatus(status);
        if (newCount !== undefined) {
            setFollowersCount(newCount);
        }
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
                    // ✅ اینجا یه تابع بدون آرگومان بده که فقط دیتا رو رفرش کنه
                    onFollowChange={() => {
                        // برای اینکه وضعیت جدید رو بگیریم، دیتا رو دوباره از سرور می‌خونیم
                        refetch().then(({ data }) => {
                            if (data?.getUserByUsername) {
                                const fresh = data.getUserByUsername;
                                setFollowersCount(fresh.followersCount);
                                setFollowingCount(fresh.followingCount);
                                setFollowStatus(
                                    fresh.isFollowRequestPending ? 'pending' :
                                        fresh.isFollowing ? 'following' : 'not-following'
                                );
                            }
                        });
                    }}
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
                    isOwner={isOwner}
                    canViewContent={canViewContent}
                    displayedFollowersCount={displayedFollowersCount}
                    displayedFollowingCount={displayedFollowingCount}
                    onFollowersClick={() => setModalType('followers')}
                    onFollowingClick={() => setModalType('following')}
                    // ✅ اینجا مستقیم handleFollowChange رو پاس بده
                    onFollowChange={handleFollowChange}
                    onCreateStory={() => setIsStoryModalOpen(true)}
                />
                <ProfileInfo user={user} />
            </div>
            {!canViewContent ? (
                <PrivateProfileMessage
                    isPrivate={user.isPrivate}
                    isFollowing={isFollowing} // ✅ از state
                    isFollowRequestPending={isFollowRequestPending} // ✅ از state
                    isOwner={isOwner}
                />
            ) : (
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
                    <ProfilePostsList userId={user.id} />
                </div>
            )}
        </>
    );
};