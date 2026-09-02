// components/profile/posts/PostItem.tsx
'use client';

import { useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import Image from 'next/image';
import {
    Eye,
    Edit,
    Trash2,
    Heart,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { formatPersianDate } from '@/app/lib/formatDate';
import { GET_POST_COMMENTS } from '@/app/graphql/post.queries';

interface PostItemProps {
    post: any;
    onDelete: (postId: string) => void;
    onEdit: (post: any) => void;
    onView: (post: any) => void;
}

export const PostItem = ({ post, onDelete, onEdit, onView }: PostItemProps) => {

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const formattedDate = formatPersianDate(post.createdAt);

    // ✅ کوئری تنبل (lazy) - فقط وقتی صدا زده می‌شه که خودمون بخوایم
    const [fetchComments, { data: commentsData, loading: commentsLoading }] =
        useLazyQuery(GET_POST_COMMENTS, {
            fetchPolicy: 'cache-first',
        });

    const comments = commentsData?.getPost?.comments || [];

    let previewText = '';
    let previewImage: string | null = null;
    let headerText = '';
    let previewVideo: string | null = null;
    try {
        const parsed = JSON.parse(post.content);
        const blocks = parsed.blocks || [];

        for (const block of blocks) {
            if (block.type === 'header' && !headerText) {
                headerText = block.content;
            }
            if (block.type === 'text' && !previewText) {
                previewText = block.content.substring(0, 80) + (block.content.length > 80 ? '...' : '');
            }
            if (block.type === 'image' && !previewImage) {
                previewImage = block.url;
            }
            if (block.type === 'video' && !previewVideo) {
                previewVideo = block.url;
            }
            if (previewText && headerText && previewImage && previewVideo) break;
        }

        if (!headerText) headerText = 'پست بدون عنوان';
        if (!previewText) previewText = 'بدون متن';
    } catch {
        previewText = post.content?.substring(0, 80) + (post.content?.length > 80 ? '...' : '');
        headerText = 'پست';
    }

    const showImage = !!previewImage;
    const showVideo = !previewImage && !!previewVideo;

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(post.id);
        setShowDeleteConfirm(false);
    };

    // ✅ فقط وقتی کاربر کلیک کرد، کوئری اجرا می‌شه
    const handleToggleComments = () => {
        if (!showComments && !commentsData) {
            fetchComments({ variables: { postId: post.id } }); // 👈 اینجا پاس داده می‌شه
        }
        setShowComments(prev => !prev);
    };

    return (
        <>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-md transition-all group">
                {showImage && (
                    <div className="relative w-full h-48 bg-border">
                        <Image
                            src={previewImage!}
                            alt="پیش‌نمایش"
                            className="w-full h-full object-cover"
                            width={400}
                            height={200}
                            unoptimized
                        />
                    </div>
                )}
                {showVideo && (
                    <div className="relative w-full h-48 bg-border overflow-hidden">
                        <video
                            src={previewVideo!}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-4">
                    <h1 className="font-bold text-text-primary text-base mb-1 line-clamp-1">
                        {headerText}
                    </h1>
                    <p className="text-xs text-secondary mb-2">
                        {formattedDate}
                    </p>
                    <p className="text-secondary text-sm line-clamp-2 mb-3">
                        {previewText}
                    </p>

                    {/* آمار لایک و کامنت */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-secondary">
                        <span className="flex items-center gap-1.5">
                            <Heart size={16} className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
                            {post.likesCount ?? 0}
                        </span>
                        <button
                            onClick={handleToggleComments}
                            disabled={(post.commentsCount ?? 0) === 0}
                            className="flex items-center gap-1.5 hover:text-primary transition-colors disabled:hover:text-secondary disabled:cursor-default"
                        >
                            <MessageCircle size={16} />
                            {post.commentsCount ?? 0}
                            {(post.commentsCount ?? 0) > 0 && (
                                showComments
                                    ? <ChevronUp size={14} />
                                    : <ChevronDown size={14} />
                            )}
                        </button>
                    </div>

                    {/* لیست کامنت‌گذاران */}
                    {showComments && (
                        <div className="mb-3 border-t border-border pt-3">
                            {commentsLoading ? (
                                <div className="flex justify-center py-3">
                                    <Loader2 size={18} className="animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="flex items-start gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {comment.user?.avatar ? (
                                                    <Image
                                                        src={comment.user.avatar}
                                                        alt={comment.user.fullName || 'کاربر'}
                                                        className="w-full h-full object-cover"
                                                        width={28}
                                                        height={28}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="text-white font-bold text-xs">
                                                        {comment.user?.fullName?.[0] || '👤'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-text-primary">
                                                    {comment.user?.fullName || comment.user?.username || 'کاربر ناشناس'}
                                                </p>
                                                <p className="text-xs text-secondary line-clamp-2">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-1 pt-3 border-t border-border">
                        <button
                            onClick={() => onView(post)}
                            className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hover:cursor-pointer"
                            title="مشاهده کامل"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={() => onEdit(post)}
                            className="p-2 text-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors hover:cursor-pointer"
                            title="ویرایش"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors hover:cursor-pointer"
                            title="حذف"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="حذف پست"
                message="آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟ این عملیات قابل بازگشت نیست."
                confirmText="حذف پست"
                cancelText="انصراف"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};