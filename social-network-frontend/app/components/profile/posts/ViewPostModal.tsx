// components/profile/posts/ViewPostModal.tsx
'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import {
    useState,
    useEffect
} from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { PostComment, PostReply } from './ViewPostModal/types';
import { formatPersianDate } from '@/app/lib/formatDate';
import { CommentsList } from './ViewPostModal/CommentsList';
import { GET_POST_COMMENTS } from '@/app/graphql/post.queries';
import { PostContentBlocks } from './ViewPostModal/PostContentBlocks';


interface ViewPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    children?: (opts: {
        postId: string;
        onCommentAdded: (comment: PostComment) => void;
    }) => React.ReactNode;
}

export const ViewPostModal = ({ post, isOpen, onClose, children }: ViewPostModalProps) => {
    const [comments, setComments] = useState<PostComment[]>([]);
    const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);

    const [fetchComments, { data: commentsData, loading: commentsLoading }] =
        useLazyQuery(GET_POST_COMMENTS, {
            fetchPolicy: 'network-only',
        });

    useEffect(() => {
        if (isOpen && post?.id) {
            fetchComments({ variables: { postId: post.id } });
        }
    }, [isOpen, post?.id, fetchComments]);

    useEffect(() => {
        if (commentsData?.getPost?.comments) {
            setComments(commentsData.getPost.comments);
        }
    }, [commentsData]);

    if (!isOpen) return null;

    const formattedDate = formatPersianDate(post.createdAt);

    let contentBlocks = [];
    try {
        const parsed = JSON.parse(post.content);
        contentBlocks = parsed.blocks || [];
    } catch {
        contentBlocks = [{ type: 'text', content: post.content }];
    }

    const handleCommentAdded = (comment: PostComment) => {
        setComments(prev => [comment, ...prev]);
    };

    const handleReplyAdded = (parentCommentId: string, reply: PostReply) => {
        setComments(prev =>
            prev.map(comment =>
                comment.id === parentCommentId
                    ? { ...comment, replies: [...(comment.replies || []), reply] }
                    : comment
            )
        );
    };

    return (
        <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
            p-4
        ">
            <div
                className="
                bg-card
                rounded-2xl
                p-6
                max-w-3xl
                w-full
                max-h-[90vh]
                overflow-y-auto
                shadow-xl
            ">
                <div
                    className="
                    flex
                    items-center
                    justify-between
                    mb-4
                ">
                    <h1
                        className="
                        text-xl
                        font-bold
                        text-primary
                    ">مشاهده پست
                    </h1>
                    <button
                        onClick={onClose}
                        className="
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors
                        cursor-pointer
                    ">
                        <X
                            size={24}
                        />
                    </button>
                </div>
                <div
                    className="
                    flex
                    items-center
                    gap-3
                    mb-4
                ">
                    <div
                        className="
                        w-10
                        h-10
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                        flex-shrink-0
                    ">
                        {post.user?.avatar ? (
                            <Image
                                src={post.user.avatar}
                                alt={post.user.fullName || 'کاربر'}
                                className="
                                w-full
                                h-full
                                object-cover"
                                width={100}
                                height={100}
                                unoptimized
                            />
                        ) : (
                            <span
                                className="
                                text-white
                                font-bold
                                text-sm
                            ">
                                {post.user?.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <div
                        className="
                        pt-2
                    ">
                        <p
                            className="
                            font-medium
                            text-primary
                            text-sm
                        ">
                            {post.user?.fullName || 'کاربر ناشناس'}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                        ">
                            {post.user?.username || 'unknown'}@
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                        ">
                            {formattedDate}
                        </p>
                    </div>
                </div>
                <PostContentBlocks contentBlocks={contentBlocks} />
                <div
                    className="
                    flex
                    gap-6
                    pt-3
                    border-t
                    border-border
                    text-sm
                    text-secondary
                    mb-4
                ">
                    <span>🕐 {formattedDate}</span>
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <span>✏️ ویرایش شده</span>
                    )}
                </div>
                {children && (
                    <div
                        className="
                        mb-4
                        pb-4
                        border-b
                        border-border
                    ">
                        {children({ postId: post.id, onCommentAdded: handleCommentAdded })}
                    </div>
                )}
                <CommentsList
                    comments={comments}
                    loading={commentsLoading}
                    postId={post.id}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onReplyAdded={handleReplyAdded}
                />
            </div>
        </div>
    );
};