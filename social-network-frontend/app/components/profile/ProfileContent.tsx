'use client';

import { useState } from 'react';
import Settings from './settings';
import { motion } from 'framer-motion';
import ProfileInfo from './ProfileInfo';
import { PostList } from './posts/PostList';
import ChangePassword from './ChangePassword';
import { CreatePost } from './posts/CreatePost';
import { ViewPostModal } from './posts/ViewPostModal';
import { EditPostModal } from './posts/EditPostModal';
import { EditProfileForm } from './EditProfile/EditProfile';

interface ProfileContentProps {
    user: any;
    loading: boolean;
    activeTab: string;
}

export const ProfileContent = ({ user, loading, activeTab }: ProfileContentProps) => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [refreshTrigger] = useState(0);
    const [updatedPost, setUpdatedPost] = useState<any>(null);
    // ✅ تابع مشاهده پست
    const handleView = (post: any) => {
        setSelectedPost(post);
        setViewModalOpen(true);
    };

    // ✅ تابع ویرایش پست
    const handleEdit = (post: any) => {
        setSelectedPost(post);
        setEditModalOpen(true);
    };

    // ✅ تابع بعد از ویرایش موفق
    const handleEditSuccess = (post: any) => {
        setEditModalOpen(false);
        setSelectedPost(post);
        setUpdatedPost(post);
    };
    if (loading) {
        return (
            <div
                className="
                flex
                items-center
                justify-center
                min-h-[300px]
                ">
                <div
                    className="
                    text-center
                    ">
                    <div
                        className="
                        w-10
                        h-10
                        border-4
                        border-primary
                        border-t-transparent
                        rounded-full
                        animate-spin
                        mx-auto"
                    />
                    <p
                        className="
                        mt-4
                        text-sm
                        text-secondary
                        ">در حال بارگذاری...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div
                className="
                flex
                items-center
                justify-center
                min-h-[300px]
                ">
                <div
                    className="
                    text-center
                    ">
                    <p
                        className="
                        text-secondary
                        ">لطفاً وارد حساب خود شوید.
                    </p>
                    <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="
                        mt-4
                        btn-primary
                        text-sm
                        px-6
                        py-2
                        ">
                        ورود
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileInfo user={user} />;
            case 'edit':
                return <EditProfileForm user={user} />;
            case 'change-password':
                return <ChangePassword />;
            case 'settings':
                return <Settings />;
            case 'posts':
                return (
                    <PostList
                        userId={user.id}
                        onEdit={handleEdit}
                        onView={handleView}
                        refreshTrigger={refreshTrigger}
                        updatedPost={updatedPost}
                    />
                );
            case 'create-post':
                return <CreatePost />;
            default:
                return <ProfileInfo user={user} />;
        }
    };

    return (
        <>
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderContent()}
            </motion.div>

            {/* ✅ مودال مشاهده پست */}
            {viewModalOpen && selectedPost && (
                <ViewPostModal
                    post={selectedPost}
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                />
            )}

            {/* ✅ مودال ویرایش پست */}
            {editModalOpen && selectedPost && (
                <EditPostModal
                    post={selectedPost}
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
};