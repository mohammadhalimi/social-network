'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { LIKE_COMMENT, UNLIKE_COMMENT } from '@/app/graphql/post.queries';

interface CommentLikeButtonProps {
    commentId: string;
    initialIsLiked: boolean;
    initialLikesCount: number;
}

export const CommentLikeButton = ({
    commentId,
    initialIsLiked,
    initialLikesCount,
}: CommentLikeButtonProps) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const [likeComment] = useMutation(LIKE_COMMENT, { errorPolicy: 'all' });
    const [unlikeComment] = useMutation(UNLIKE_COMMENT, { errorPolicy: 'all' });

    const handleClick = async () => {
        const newIsLiked = !isLiked;
        const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        // ✅ Optimistic Update
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        try {
            if (newIsLiked) {
                const { error } = await likeComment({ variables: { commentId } });
                if (error) {
                    // Rollback
                    setIsLiked(!newIsLiked);
                    setLikesCount(likesCount);
                    toast.error(error.message || 'خطا در لایک کردن');
                }
            } else {
                const { error } = await unlikeComment({ variables: { commentId } });
                if (error) {
                    // Rollback
                    setIsLiked(!newIsLiked);
                    setLikesCount(likesCount);
                    toast.error(error.message || 'خطا در آنلایک کردن');
                }
            }
        } catch (err: any) {
            setIsLiked(!newIsLiked);
            setLikesCount(likesCount);
            toast.error(err.message || 'خطایی رخ داد');
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`
                flex items-center gap-1 text-xs transition-colors
                ${isLiked ? 'text-red-500' : 'text-secondary hover:text-red-500'}
            `}
            aria-label={isLiked ? 'آنلایک' : 'لایک'}
        >
            <Heart
                size={12}
                className={`transition-all ${isLiked ? 'fill-red-500' : ''}`}
            />
            {likesCount > 0 && <span>{likesCount}</span>}
        </button>
    );
};