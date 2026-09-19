// components/profile/posts/PostItem/PostCommentsPreview.tsx
'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { PostCommentPreview } from './types';

interface PostCommentsPreviewProps {
    comments: PostCommentPreview[];
    loading: boolean;
}

export const PostCommentsPreview = ({ comments, loading }: PostCommentsPreviewProps) => {
    if (loading) {
        return (
            <div
                className="
                    flex
                    justify-center
                    py-3
            ">
                <Loader2
                    size={18}
                    className="
                    animate-spin
                    text-primary
                "/>
            </div>
        );
    }

    if (comments.length === 0) {
        return null;
    }

    return (
        <div
            className="
            space-y-2
            max-h-48
            overflow-y-auto
        ">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="
                    flex
                    items-start
                    gap-2
                ">
                    <div
                        className="
                        w-7
                        h-7
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                        flex-shrink-0
                    ">
                        {comment.user?.avatar ? (
                            <Image
                                src={comment.user.avatar}
                                alt={comment.user.fullName || 'کاربر'}
                                className="
                                w-full
                                h-full
                                object-cover"
                                width={28}
                                height={28}
                                unoptimized
                            />
                        ) : (
                            <span
                                className="
                                text-white
                                font-bold
                                text-xs
                            ">
                                {comment.user?.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <div
                        className="
                        flex-1
                        min-w-0
                    ">
                        <p
                            className="
                            text-xs
                            font-medium
                            text-primary
                        ">
                            {comment.user?.fullName || comment.user?.username || 'کاربر ناشناس'}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                            line-clamp-2
                        ">
                            {comment.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};