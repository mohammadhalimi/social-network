'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMMENT_ON_POST } from '@/app/graphql/post.queries';

interface CommentFormProps {
    postId: string;
    onCommentAdded: (comment: any) => void;
}

export const CommentForm = ({ postId, onCommentAdded }: CommentFormProps) => {
    const [content, setContent] = useState('');

    const [commentOnPost, { loading }] = useMutation(COMMENT_ON_POST, {
        onCompleted: (data) => {
            if (data.commentOnPost.success && data.commentOnPost.comment) {
                onCommentAdded(data.commentOnPost.comment);
                setContent('');
            } else {
                toast.error(data.commentOnPost.message || 'خطا در ثبت کامنت');
            }
        },
        onError: (error: any) => {
            console.error('Error commenting on post:', error);
            toast.error(error.message || 'خطا در ثبت کامنت');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = content.trim();
        if (!trimmed) return;

        commentOnPost({ variables: { postId, content: trimmed } });
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="نظر خود را بنویسید..."
                rows={2}
                disabled={loading}
                className="flex-1 bg-transparent border border-border rounded-xl focus:border-primary outline-none p-2.5 text-sm text-text-primary placeholder:text-text-secondary resize-none disabled:opacity-60"
            />
            <button
                type="submit"
                disabled={loading || !content.trim()}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </form>
    );
};