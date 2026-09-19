// components/profile/posts/PostItem/index.tsx
'use client';

import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { PostStats } from './PostItem/PostStats';
import { useLazyQuery } from '@apollo/client/react';
import { formatPersianDate } from '@/app/lib/formatDate';
import { PostActionsBar } from './PostItem/PostActionsBar';
import { GET_POST_COMMENTS } from '@/app/graphql/post.queries';
import { PostPreviewMedia } from './PostItem/PostPreviewMedia';
import {
    PostItemProps,
    PostPreviewData
} from './PostItem/types';
import { PostCommentsPreview } from './PostItem/PostCommentsPreview';

export const PostItem = ({ post, onDelete, onEdit, onView }: PostItemProps) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const formattedDate = formatPersianDate(post.createdAt);

    // ✅ کوئری تنبل (lazy) برای کامنت‌ها
    const [fetchComments, { data: commentsData, loading: commentsLoading }] =
        useLazyQuery(GET_POST_COMMENTS, {
            fetchPolicy: 'cache-first',
        });

    const comments = commentsData?.getPost?.comments || [];

    // ✅ پارس کردن محتوای پست
    const previewData: PostPreviewData = (() => {
        try {
            const parsed = JSON.parse(post.content);
            const blocks = parsed.blocks || [];

            let headerText = '';
            let previewText = '';
            let previewImage: string | null = null;
            let previewVideo: string | null = null;

            for (const block of blocks) {
                if (block.type === 'header' && !headerText) headerText = block.content;
                if (block.type === 'text' && !previewText) {
                    previewText = block.content.substring(0, 80) + (block.content.length > 80 ? '...' : '');
                }
                if (block.type === 'image' && !previewImage) previewImage = block.url;
                if (block.type === 'video' && !previewVideo) previewVideo = block.url;
                if (previewText && headerText && previewImage && previewVideo) break;
            }

            return {
                headerText: headerText || 'پست بدون عنوان',
                previewText: previewText || 'بدون متن',
                previewImage,
                previewVideo,
            };
        } catch {
            return {
                headerText: 'پست',
                previewText: post.content?.substring(0, 80) + (post.content?.length > 80 ? '...' : ''),
                previewImage: null,
                previewVideo: null,
            };
        }
    })();

    const handleConfirmDelete = () => {
        onDelete(post.id);
        setShowDeleteConfirm(false);
    };

    const handleToggleComments = () => {
        if (!showComments && !commentsData) {
            fetchComments({ variables: { postId: post.id } });
        }
        setShowComments(prev => !prev);
    };

    return (
        <>
            <div
                className="
                bg-card
                border
                border-border
                rounded-2xl
                overflow-hidden
                shadow-soft
                hover:shadow-md
                transition-all
                group
            ">
                {/* پیش‌نمایش مدیا */}
                <PostPreviewMedia
                    previewImage={previewData.previewImage}
                    previewVideo={previewData.previewVideo}
                />

                <div className="p-4">
                    <h1
                        className="
                        font-bold
                        text-primary
                        text-base
                        mb-1
                        line-clamp-1
                    ">
                        {previewData.headerText}
                    </h1>
                    <p
                        className="
                        text-xs
                        text-secondary
                        mb-2
                    ">
                        {formattedDate}
                    </p>
                    <p
                        className="
                        text-secondary
                        text-sm
                        line-clamp-2
                        mb-3
                    ">
                        {previewData.previewText}
                    </p>

                    {/* آمار لایک و کامنت */}
                    <PostStats
                        isLiked={post.isLiked}
                        likesCount={post.likesCount ?? 0}
                        commentsCount={post.commentsCount ?? 0}
                        showComments={showComments}
                    />

                    {/* دکمه‌های اکشن */}
                    <PostActionsBar
                        onView={() => onView(post)}
                        onEdit={() => onEdit(post)}
                        onDelete={() => setShowDeleteConfirm(true)}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="حذف پست"
                message="آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟ این عملیات قابل بازگشت نیست."
                confirmText="حذف پست"
                cancelText="انصراف"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};