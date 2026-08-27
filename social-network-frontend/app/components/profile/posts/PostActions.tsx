'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LIKE_POST, UNLIKE_POST, DELETE_POST } from '@/app/graphql/post.queries';
import { Heart, MessageCircle, Share2, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostActionsProps {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onCommentClick: () => void;
  onLikeUpdate?: (isLiked: boolean, likesCount: number) => void;
  showDelete?: boolean;
  showEdit?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const PostActions = ({
  postId,
  isLiked: initialIsLiked,
  likesCount: initialLikesCount,
  commentsCount,
  onCommentClick,
  onLikeUpdate,
  showDelete = false,
  showEdit = false,
  onDelete,
  onEdit,
}: PostActionsProps) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const [deletePost] = useMutation(DELETE_POST);

  const handleLike = async () => {
    try {
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      // به‌روزرسانی optimistic
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      if (onLikeUpdate) {
        onLikeUpdate(newIsLiked, newLikesCount);
      }

      if (newIsLiked) {
        await likePost({ variables: { postId } });
      } else {
        await unlikePost({ variables: { postId } });
      }
    } catch (error) {
      // برگشت به حالت قبلی در صورت خطا
      setIsLiked(!isLiked);
      setLikesCount(likesCount);
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('آیا از حذف این پست اطمینان دارید؟')) return;

    setIsDeleting(true);
    try {
      await deletePost({ variables: { postId } });
      
      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
        router.push('/feed');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('خطا در حذف پست');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'مشاهده پست',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک کپی شد!');
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <div className="flex items-center gap-6">
        {/* دکمه لایک */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-colors group ${
            isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
          }`}
        >
          <Heart 
            className={`w-5 h-5 transition-all group-hover:scale-110 ${
              isLiked ? 'fill-red-500' : ''
            }`} 
          />
          <span className="font-medium">{likesCount}</span>
        </button>

        {/* دکمه کامنت */}
        <button
          onClick={onCommentClick}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors group"
        >
          <MessageCircle className="w-5 h-5 transition-all group-hover:scale-110" />
          <span className="font-medium">{commentsCount}</span>
        </button>

        {/* دکمه اشتراک‌گذاری */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors group"
        >
          <Share2 className="w-5 h-5 transition-all group-hover:scale-110" />
        </button>
      </div>

      {/* منوی اکشن‌ها */}
      {(showEdit || showDelete) && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-border transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[150px] z-10">
              {showEdit && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onEdit) onEdit();
                  }}
                  className="w-full px-4 py-2 text-right text-sm text-text-primary hover:bg-border/50 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  ویرایش
                </button>
              )}
              
              {showDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-right text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'در حال حذف...' : 'حذف'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};