// components/profile/posts/CommentItem.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ReplyItem } from './ReplyItem';
import {
    PostComment,
    PostReply
} from './types';
import { CommentLikeButton } from './CommentLikeButton';
import { formatPersianDate } from '@/app/lib/formatDate';
import { CommentForm } from '../../../UserName/CommentForm';
import {
    Reply,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface CommentItemProps {
    comment: PostComment;
    postId: string;
    replyingTo: PostComment | null;
    setReplyingTo: (comment: PostComment | null) => void;
    onReplyAdded: (parentCommentId: string, reply: PostReply) => void;
}

export const CommentItem = ({
    comment,
    postId,
    replyingTo,
    setReplyingTo,
    onReplyAdded,
}: CommentItemProps) => {
    const [showReplies, setShowReplies] = useState(false);

    return (
        <div>
            <div
                className="
                flex
                items-start
                gap-2.5
            ">
                <div
                    className="
                    w-9
                    h-9
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
                            alt={comment.user.fullName}
                            className="
                            w-full
                            h-full
                            object-cover"
                            width={36}
                            height={36}
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
                    <div
                        className="
                        bg-border/40
                        rounded-2xl
                        rounded-tr-sm
                        px-3.5
                        py-2.5
                    ">
                        <p
                            className="
                            text-xs
                            font-bold
                            text-primary
                            mb-0.5
                        ">
                            {comment.user?.fullName || comment.user?.username || 'کاربر ناشناس'}
                        </p>
                        <p
                            className="
                            text-sm
                            text-primary
                            whitespace-pre-wrap
                            leading-relaxed
                        ">
                            {comment.content}
                        </p>
                    </div>
                    <div
                        className="
                        flex
                        items-center
                        gap-3
                        mt-1.5
                        px-1
                    ">
                        <span
                            className="
                            text-[11px]
                            text-secondary
                        ">
                            {formatPersianDate(comment.createdAt)}
                        </span>
                        <CommentLikeButton
                            commentId={comment.id}
                            initialIsLiked={comment.isLiked}
                            initialLikesCount={comment.likesCount}
                        />
                        <button
                            onClick={() => setReplyingTo(replyingTo?.id === comment.id ? null : comment)}
                            className={`
                                text-xs
                                font-medium
                                flex
                                items-center
                                gap-1
                                transition-colors
                                cursor-pointer
                                ${replyingTo?.id === comment.id
                                    ? 'text-primary'
                                    : 'text-secondary hover:text-primary'
                                }`}
                        >
                            <Reply size={13} />
                            پاسخ
                        </button>
                    </div>
                    {replyingTo?.id === comment.id && (
                        <div className="mt-2">
                            <CommentForm
                                postId={postId}
                                parentCommentId={comment.id}
                                onCommentAdded={(reply) => onReplyAdded(comment.id, reply)}
                                onCancelReply={() => setReplyingTo(null)}
                            />
                        </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(prev => !prev)}
                            className="
                            flex
                            items-center
                            gap-1.5
                            mt-2
                            text-xs
                            font-medium
                            text-primary
                            hover:text-primary
                            transition-colors
                            cursor-pointer
                            ">
                            <span
                                className="w-6 h-px bg-primary/40" />
                            {showReplies ? (
                                <>
                                    پنهان کردن {comment.replies.length} پاسخ
                                    <ChevronUp size={13} />
                                </>
                            ) : (
                                <>
                                    نمایش {comment.replies.length} پاسخ
                                    <ChevronDown size={13} />
                                </>
                            )}
                        </button>
                    )}

                    {/* لیست ریپلای‌ها */}
                    {comment.replies && comment.replies.length > 0 && showReplies && (
                        <div className="mt-3 pr-4 border-r-2 border-primary/20 space-y-3">
                            {comment.replies.map((reply) => (
                                <ReplyItem key={reply.id} reply={reply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};