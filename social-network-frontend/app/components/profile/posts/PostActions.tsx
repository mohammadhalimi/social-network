// components/feed/PostActions.tsx (یا هر جای دیگه)
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LIKE_POST, UNLIKE_POST } from '@/app/graphql/post.queries';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostActionsProps {
    postId: string;
    isLiked: boolean;
    likesCount: number;
    commentsCount: number;
    onCommentClick: () => void;
    onLikeUpdate?: (isLiked: boolean, likesCount: number) => void;
}

export const PostActions = ({
    postId,
    isLiked: initialIsLiked,
    likesCount: initialLikesCount,
    commentsCount,
    onCommentClick,
    onLikeUpdate,
}: PostActionsProps) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const [likePost] = useMutation(LIKE_POST);
    const [unlikePost] = useMutation(UNLIKE_POST);

    const handleLike = async () => {
        try {
            const newIsLiked = !isLiked;
            const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

            setIsLiked(newIsLiked);
            setLikesCount(newLikesCount);

            if (onLikeUpdate) {
                onLikeUpdate(newIsLiked, newLikesCount);
            }

            if (newIsLiked) {
                await likePost({ variables: { postId } });
            } else {
                await unlikePost({ variables: { postId } });
            }
        } catch (error) {
            setIsLiked(!isLiked);
            setLikesCount(likesCount);
            console.error('Error toggling like:', error);
            toast.error('خطا در لایک کردن');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'مشاهده پست',
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('لینک کپی شد!');
        }
    };

    return (
        <div
            className="
            flex
            items-center
            gap-6
            pt-3
            border-t
            border-border
        ">
            <button
                onClick={handleLike}
                className={`
                    flex
                    items-center
                    gap-2
                    text-sm
                    transition-colors
                    group
                    ${isLiked ? 'text-red-500' : 'text-secondary hover:text-red-500'}`}
            >
                <Heart
                    className={`
                        w-5
                        h-5
                        transition-all
                        group-hover:scale-110
                        ${isLiked ? 'fill-red-500' : ''}`}
                />
                <span
                    className="
                    font-medium
                ">
                    {likesCount}
                </span>
            </button>

            <button
                onClick={onCommentClick}
                className="
                flex
                items-center
                gap-2
                text-sm
                text-secondary
                hover:text-primary
                transition-colors
                group
                ">
                <MessageCircle
                    className="
                    w-5
                    h-5
                    transition-all
                    group-hover:scale-110
                "/>
                <span
                    className="
                    font-medium
                ">
                    {commentsCount}
                </span>
            </button>

            <button
                onClick={handleShare}
                className="
                flex
                items-center
                gap-2
                text-sm
                text-secondary
                hover:text-primary
                transition-colors
                group
                ">
                <Share2
                    className="
                    w-5
                    h-5
                    transition-all
                    group-hover:scale-110
                "/>
            </button>
        </div>
    );
};