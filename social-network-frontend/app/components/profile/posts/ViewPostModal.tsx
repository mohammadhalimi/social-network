'use client';

import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import Image from 'next/image';
import { X, Loader2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPersianDate } from '@/app/lib/formatDate';
import { GET_POST_COMMENTS } from '@/app/graphql/post.queries';
import { CommentForm } from '../../UserName/CommentForm';

interface PostCommentUser {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
}

interface PostReply {
    id: string;
    content: string;
    createdAt: string;
    user: PostCommentUser;
}

interface PostComment {
    id: string;
    content: string;
    createdAt: string;
    user: PostCommentUser;
    replies?: PostReply[];
}

interface ViewPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    // ✅ render prop اختیاری - فقط جایی که فرم کامنت لازمه پاس داده می‌شه
    children?: (opts: {
        postId: string;
        onCommentAdded: (comment: PostComment) => void;
    }) => React.ReactNode;
}

export const ViewPostModal = ({ post, isOpen, onClose, children }: ViewPostModalProps) => {
    const [comments, setComments] = useState<PostComment[]>([]);
    const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
    const [showRepliesMap, setShowRepliesMap] = useState<Record<string, boolean>>({});
    const [fetchComments, { data: commentsData, loading: commentsLoading }] =
        useLazyQuery(GET_POST_COMMENTS, {
            fetchPolicy: 'network-only',
        });

    // ✅ هر بار مودال باز شد، کامنت‌ها رو تازه بگیر
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

    // ✅ وقتی کامنت جدید با موفقیت ثبت شد، به ابتدای لیست اضافه می‌شه
    const handleCommentAdded = (comment: PostComment) => {
        setComments(prev => [comment, ...prev]);
    };
    const handleReplyAdded = (parentCommentId: string, reply: PostComment) => {
        setComments(prev =>
            prev.map(comment =>
                comment.id === parentCommentId
                    ? { ...comment, replies: [...(comment.replies || []), reply] }
                    : comment
            )
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-primary">مشاهده پست</h1>
                    <button onClick={onClose} className="p-1 hover:bg-border rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                        {post.user?.avatar ? (
                            <Image
                                src={post.user.avatar}
                                alt={post.user.fullName || 'کاربر'}
                                className="w-full h-full object-cover"
                                width={100}
                                height={100}
                                unoptimized
                            />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {post.user?.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <div className="pt-2">
                        <p className="font-medium text-primary text-sm">
                            {post.user?.fullName || 'کاربر ناشناس'}
                        </p>
                        <p className="text-xs text-secondary">
                            {post.user?.username || 'unknown'}@
                        </p>
                        <p className="text-xs text-secondary">{formattedDate}</p>
                    </div>
                </div>

                <div className="mb-4">
                    {contentBlocks.map((block: any, index: number) => {
                        switch (block.type) {
                            case 'header':
                                return (
                                    <h1 key={index} className="text-2xl font-bold text-primary mb-3">
                                        {block.content}
                                    </h1>
                                );
                            case 'image':
                                if (!block.url) return null;
                                return (
                                    <div key={index} className="my-3 rounded-xl overflow-hidden">
                                        <Image
                                            src={block.url}
                                            alt={block.caption || 'تصویر'}
                                            className="w-full h-auto object-cover"
                                            width={800}
                                            height={500}
                                            unoptimized
                                        />
                                        {block.caption && (
                                            <p className="text-xs text-secondary mt-1">{block.caption}</p>
                                        )}
                                    </div>
                                );
                            case 'video':
                                if (!block.url) return null;
                                return (
                                    <div
                                        key={index}
                                        className="my-3 rounded-xl overflow-hidden flex justify-center bg-black"
                                    >
                                        <video
                                            src={block.url}
                                            controls
                                            className="max-h-[500px] w-auto max-w-full object-contain"
                                        />
                                    </div>
                                );
                            default:
                                return (
                                    <p key={index} className="text-primary leading-relaxed mb-2 whitespace-pre-wrap">
                                        {block.content}
                                    </p>
                                );
                        }
                    })}
                </div>

                <div className="flex gap-6 pt-3 border-t border-border text-sm text-secondary mb-4">
                    <span>🕐 {formattedDate}</span>
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <span>✏️ ویرایش شده</span>
                    )}
                </div>

                {/* ✅ بخش نوشتن کامنت - فقط اگه از بیرون پاس داده شده باشه */}
                {children && (
                    <div className="mb-4 pb-4 border-b border-border">
                        {children({ postId: post.id, onCommentAdded: handleCommentAdded })}
                    </div>
                )}

                {/* ✅ لیست کامنت‌ها و ریپلای‌ها */}
                <div>
                    <h2 className="text-sm font-bold text-text-primary mb-3">
                        کامنت‌ها ({comments.length})
                    </h2>

                    {commentsLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 size={20} className="animate-spin text-primary" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-secondary text-center py-4">
                            هنوز کامنتی ثبت نشده است
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {comments.map((comment) => (
                                <div key={comment.id}>
                                    {/* کامنت اصلی */}
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {comment.user?.avatar ? (
                                                <Image
                                                    src={comment.user.avatar}
                                                    alt={comment.user.fullName}
                                                    className="w-full h-full object-cover"
                                                    width={36}
                                                    height={36}
                                                    unoptimized
                                                />
                                            ) : (
                                                <span className="text-white font-bold text-xs">
                                                    {comment.user?.fullName?.[0] || '👤'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="bg-border/40 rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                                                <p className="text-xs font-bold text-text-primary mb-0.5">
                                                    {comment.user?.fullName || comment.user?.username || 'کاربر ناشناس'}
                                                </p>
                                                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>

                                            {/* نوار پایین کامنت: تاریخ + دکمه‌ی پاسخ */}
                                            <div className="flex items-center gap-3 mt-1.5 px-1">
                                                <span className="text-[11px] text-secondary">
                                                    {formatPersianDate(comment.createdAt)}
                                                </span>
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo?.id === comment.id ? null : comment)}
                                                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${replyingTo?.id === comment.id
                                                            ? 'text-primary'
                                                            : 'text-secondary hover:text-primary'
                                                        }`}
                                                >
                                                    <Reply size={13} />
                                                    پاسخ
                                                </button>
                                            </div>

                                            {/* فرم ریپلای */}
                                            {replyingTo?.id === comment.id && (
                                                <div className="mt-2">
                                                    <CommentForm
                                                        postId={post.id}
                                                        parentCommentId={comment.id}
                                                        onCommentAdded={(reply) => handleReplyAdded(comment.id, reply)}
                                                        onCancelReply={() => setReplyingTo(null)}
                                                    />
                                                </div>
                                            )}

                                            {/* دکمه‌ی نمایش/پنهان کردن پاسخ‌ها */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        setShowRepliesMap(prev => ({
                                                            ...prev,
                                                            [comment.id]: !prev[comment.id],
                                                        }))
                                                    }
                                                    className="flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                                                >
                                                    <span className="w-6 h-px bg-primary/40" />
                                                    {showRepliesMap[comment.id] ? (
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
                                            {comment.replies && comment.replies.length > 0 && showRepliesMap[comment.id] && (
                                                <div className="mt-3 pr-4 border-r-2 border-primary/20 space-y-3">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex items-start gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {reply.user?.avatar ? (
                                                                    <Image
                                                                        src={reply.user.avatar}
                                                                        alt={reply.user.fullName}
                                                                        className="w-full h-full object-cover"
                                                                        width={28}
                                                                        height={28}
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    <span className="text-white font-bold text-[10px]">
                                                                        {reply.user?.fullName?.[0] || '👤'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="bg-primary/5 border border-primary/10 rounded-xl rounded-tr-sm px-3 py-2">
                                                                    <p className="text-[11px] font-bold text-text-primary mb-0.5">
                                                                        {reply.user?.fullName || reply.user?.username}
                                                                    </p>
                                                                    <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                                                                        {reply.content}
                                                                    </p>
                                                                </div>
                                                                <span className="text-[10px] text-secondary mt-1 block px-1">
                                                                    {formatPersianDate(reply.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};