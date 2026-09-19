'use client';

import {
    Heart,
    MessageCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface PostStatsProps {
    isLiked: boolean;
    likesCount: number;
    commentsCount: number;
    showComments: boolean;
}

export const PostStats = ({
    isLiked,
    likesCount,
    commentsCount,
    showComments,
}: PostStatsProps) => {
    const hasComments = commentsCount > 0;

    return (
        <div
            className="
            flex
            items-center
            gap-4
            mb-3
            text-sm
            text-secondary
        ">
            <span
                className="
                flex
                items-center
                gap-1.5
            ">
                <Heart
                    size={16}
                    className={isLiked ? 'fill-red-500 text-red-500' : ''}
                />
                {likesCount ?? 0}
            </span>
            <span
                className="
                flex
                items-center
                gap-1.5
            ">
                <MessageCircle size={16} />
                {commentsCount ?? 0}
                {hasComments && showComments}
            </span>

        </div>
    );
};