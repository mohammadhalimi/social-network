'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CommentForm } from './CommentForm';
import { formatPersianDate } from '@/app/lib/formatDate';
import { PostActions } from '../profile/posts/PostActions';
import { ViewPostModal } from '../profile/posts/ViewPostModal';

interface ProfilePostCardProps {
    post: any;
}

export const ProfilePostCard = ({ post }: ProfilePostCardProps) => {
    const [showViewModal, setShowViewModal] = useState(false);

    const formattedDate = formatPersianDate(post.createdAt);

    let previewText = '';
    let previewImage: string | null = null;
    let headerText = '';
    let previewVideo: string | null = null;

    try {
        const parsed = JSON.parse(post.content);
        const blocks = parsed.blocks || [];

        for (const block of blocks) {
            if (block.type === 'header' && !headerText) headerText = block.content;
            if (block.type === 'text' && !previewText) {
                previewText = block.content.substring(0, 80) + (block.content.length > 80 ? '...' : '');
            }
            if (block.type === 'image' && !previewImage) previewImage = block.url;
            if (block.type === 'video' && !previewVideo) previewVideo = block.url;
            if (previewText && headerText && previewImage && previewVideo) break;
        }

        if (!headerText) headerText = 'پست بدون عنوان';
        if (!previewText) previewText = 'بدون متن';
    } catch {
        previewText = post.content?.substring(0, 80) + (post.content?.length > 80 ? '...' : '');
        headerText = 'پست';
    }

    const showImage = !!previewImage;
    const showVideo = !previewImage && !!previewVideo;

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
                cursor-pointer"
                onClick={() => setShowViewModal(true)}
            >
                {showImage && (
                    <div
                        className="
                        relative
                        w-full
                        h-48
                        bg-border
                    ">
                        <Image
                            src={previewImage!}
                            alt="پیش‌نمایش"
                            className="
                            w-full
                            h-full
                            object-cover"
                            width={400}
                            height={200}
                            unoptimized
                        />
                    </div>
                )}
                {showVideo && (
                    <div
                        className="
                        relative
                        w-full
                        h-48
                        bg-border
                        overflow-hidden
                    ">
                        <video
                            src={previewVideo!}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="
                            w-full
                            h-full
                            object-cover"
                        />
                    </div>
                )}

                <div
                    className="
                p-4
                ">
                    <h1
                        className="
                        font-bold
                        text-primary
                        text-base
                        mb-1
                        line-clamp-1
                    ">
                        {headerText}
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
                        {previewText}
                    </p>

                    <div
                        onClick={(e) => e.stopPropagation()}>
                        <PostActions
                            postId={post.id}
                            isLiked={post.isLiked}
                            likesCount={post.likesCount}
                            commentsCount={post.commentsCount}
                            onCommentClick={() => setShowViewModal(true)}
                        />
                    </div>
                </div>
            </div>

            <ViewPostModal
                post={post}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
            >
                {({ postId, onCommentAdded }) => (
                    <CommentForm postId={postId} onCommentAdded={onCommentAdded} />
                )}
            </ViewPostModal>
        </>
    );
};