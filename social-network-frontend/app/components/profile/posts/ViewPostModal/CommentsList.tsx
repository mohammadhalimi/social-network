// components/profile/posts/CommentsList.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { CommentItem } from './CommentItem';
import {
    PostComment,
    PostReply
} from './types';

interface CommentsListProps {
    comments: PostComment[];
    loading: boolean;
    postId: string;
    replyingTo: PostComment | null;
    setReplyingTo: (comment: PostComment | null) => void;
    onReplyAdded: (parentCommentId: string, reply: PostReply) => void;
}

export const CommentsList = ({
    comments,
    loading,
    postId,
    replyingTo,
    setReplyingTo,
    onReplyAdded,
}: CommentsListProps) => {
    return (
        <div>
            <h1
                className="
                text-sm
                font-bold
                text-primary
                mb-3
            ">
                کامنت‌ها ({comments.length})
            </h1>

            {loading ? (
                <div
                    className="
                    flex
                    justify-center
                    py-4
                ">
                    <Loader2
                        size={20}
                        className="
                        animate-spin
                        text-primary
                    "/>
                </div>
            ) : comments.length === 0 ? (
                <p
                    className="
                    text-sm
                    text-secondary
                    text-center
                    py-4
                ">
                    هنوز کامنتی ثبت نشده است
                </p>
            ) : (
                <div className="space-y-5">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            onReplyAdded={onReplyAdded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};