// components/profile/CommentForm.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Send, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMMENT_ON_POST, REPLY_TO_COMMENT } from '@/app/graphql/post.queries';

interface CommentFormProps {
    postId: string;
    onCommentAdded: (comment: any) => void;
    // ✅ اگر این مقدار ست شود، یعنی داریم ریپلای می‌زنیم
    parentCommentId?: string | null;
    onCancelReply?: () => void;
}

export const CommentForm = ({ postId, onCommentAdded, parentCommentId = null, onCancelReply }: CommentFormProps) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ استفاده از دو useMutation جداگانه
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
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
                {/* اگر در حالت ریپلای هستیم، نشان می‌دهیم */}
                {parentCommentId && (
                    <div className="flex items-center justify-between mb-1 px-2 py-1 bg-border/50 rounded-t-lg text-xs text-secondary">
                        <span>در حال پاسخ به کامنت...</span>
                        <button type="button" onClick={onCancelReply} className="hover:text-primary">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={parentCommentId ? "پاسخ خود را بنویسید..." : "نظر خود را بنویسید..."}
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border border-border rounded-xl focus:border-primary outline-none p-2.5 text-sm text-text-primary placeholder:text-text-secondary resize-none disabled:opacity-60"
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </form>
    );
};