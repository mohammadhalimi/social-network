'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { CommentFormProps } from './CommentForm/types';
import { ReplyHeader } from './CommentForm/ReplyHeader';
import { CommentInput } from './CommentForm/CommentInput';
import {
    COMMENT_ON_POST,
    REPLY_TO_COMMENT
} from '@/app/graphql/post.queries';

export const CommentForm = ({
    postId,
    onCommentAdded,
    parentCommentId = null,
    onCancelReply,
}: CommentFormProps) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ دو useMutation جداگانه برای کامنت و ریپلای
    const [commentOnPost] = useMutation(COMMENT_ON_POST, {
        errorPolicy: 'all',
    });
    const [replyToComment] = useMutation(REPLY_TO_COMMENT, {
        errorPolicy: 'all',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = content.trim();
        if (!trimmed || isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (parentCommentId) {
                // ✅ حالت ریپلای
                const { data, error } = await replyToComment({
                    variables: { commentId: parentCommentId, content: trimmed },
                });

                if (error) {
                    toast.error(error.message || 'خطا در ثبت ریپلای');
                    return;
                }

                if (data?.replyToComment.success && data.replyToComment.comment) {
                    onCommentAdded(data.replyToComment.comment);
                    setContent('');
                    if (onCancelReply) onCancelReply();
                } else {
                    toast.error(data?.replyToComment.message || 'خطا در ثبت ریپلای');
                }
            } else {
                // ✅ حالت کامنت معمولی
                const { data, error } = await commentOnPost({
                    variables: { postId, content: trimmed },
                });

                if (error) {
                    toast.error(error.message || 'خطا در ثبت کامنت');
                    return;
                }

                if (data?.commentOnPost.success && data.commentOnPost.comment) {
                    onCommentAdded(data.commentOnPost.comment);
                    setContent('');
                } else {
                    toast.error(data?.commentOnPost.message || 'خطا در ثبت کامنت');
                }
            }
        } catch (err: any) {
            console.error('Error commenting:', err);
            toast.error(err.message || 'خطایی رخ داد');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* نوار بالای فرم در حالت ریپلای */}
            {parentCommentId && onCancelReply && (
                <ReplyHeader onCancel={onCancelReply} />
            )}

            {/* ورودی و دکمه ارسال */}
            <CommentInput
                value={content}
                onChange={setContent}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isReply={!!parentCommentId}
            />
        </div>
    );
};