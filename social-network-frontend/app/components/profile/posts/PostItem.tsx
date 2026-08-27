'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LIKE_POST, UNLIKE_POST } from '@/app/graphql/post.queries';
import { Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface PostItemProps {
    post: {
        id: string;
        content: string;
        createdAt: string;
        likesCount: number;
        commentsCount: number;
        isLiked: boolean;
        user: {
            id: string;
            username: string;
            fullName: string;
            avatar: string | null;
        };
    };
    onCommentClick: (postId: string) => void;
}

export const PostItem = ({ post, onCommentClick }: PostItemProps) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);

    const [likePost] = useMutation(LIKE_POST);
    const [unlikePost] = useMutation(UNLIKE_POST);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await unlikePost({ variables: { postId: post.id } });
                setLikesCount((prev) => prev - 1);
                setIsLiked(false);
            } else {
                await likePost({ variables: { postId: post.id } });
                setLikesCount((prev) => prev + 1);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // فرمت تاریخ
    const formattedDate = new Date(post.createdAt).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // پارس کردن محتوای JSON
    let contentBlocks = [];
    try {
        contentBlocks = JSON.parse(post.content).blocks || [];
    } catch {
        contentBlocks = [{ type: 'text', content: post.content }];
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-4">
            {/* هدر پست: اطلاعات کاربر */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.user.avatar ? (
                        <Image
                            src={post.user.avatar}
                            alt={post.user.fullName}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                            unoptimized
                        />
                    ) : (
                        <span className="text-white font-bold text-sm">
                            {post.user.fullName?.[0] || '👤'}
                        </span>
                    )}
                </div>
                <div>
                    <p className="font-medium text-text-primary text-sm">
                        {post.user.fullName}
                    </p>
                    <p className="text-xs text-text-secondary">
                        @{post.user.username} • {formattedDate}
                    </p>
                </div>
            </div>

            {/* محتوای پست */}
            <div className="mb-4">
                {contentBlocks.map((block: any, index: number) => {
                    switch (block.type) {
                        case 'header':
                            return (
                                <h2 key={index} className="text-xl font-bold text-text-primary mb-2">
                                    {block.content}
                                </h2>
                            );
                        case 'image':
                            return (
                                <div key={index} className="my-3 rounded-xl overflow-hidden">
                                    <Image
                                        src={block.url}
                                        alt={block.caption || 'تصویر'}
                                        className="w-full h-auto object-cover"
                                        width={100}
                                        height={100}
                                        unoptimized
                                    />
                                    {block.caption && (
                                        <p className="text-xs text-text-secondary mt-1">{block.caption}</p>
                                    )}
                                </div>
                            );
                        case 'video':
                            return (
                                <div key={index} className="my-3 rounded-xl overflow-hidden">
                                    <video
                                        src={block.url}
                                        controls
                                        className="w-full h-auto"
                                    />
                                </div>
                            );
                        default:
                            return (
                                <p key={index} className="text-text-primary leading-relaxed mb-2">
                                    {block.content}
                                </p>
                            );
                    }
                })}
            </div>

            {/* دکمه‌های تعامل */}
            <div className="flex items-center gap-6 pt-3 border-t border-border">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{likesCount}</span>
                </button>

                <button
                    onClick={() => onCommentClick(post.id)}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                </button>
            </div>
        </div>
    );
};