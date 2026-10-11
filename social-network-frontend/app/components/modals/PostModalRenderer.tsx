'use client';

import { useQuery } from '@apollo/client/react';
import { Loader2, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { closePostModal } from '@/app/redux/uiSlice';
import { GET_POST_BY_ID } from '@/app/graphql/post.queries';
import { ViewPostModal } from '@/app/components/profile/posts/ViewPostModal';
import { CommentForm } from '@/app/components/UserName/CommentForm';

export const PostModalRenderer = () => {
    const dispatch = useAppDispatch();
    const postId = useAppSelector((state) => state.ui.postModalId);

    // ✅ فقط وقتی postId وجود داره، Query بزن
    const { data, loading, error } = useQuery(GET_POST_BY_ID, {
        variables: { postId: postId || '' },
        skip: !postId,
        fetchPolicy: 'network-only',
    });

    const handleClose = () => {
        dispatch(closePostModal());
    };

    // ✅ اگر postId نیست، هیچی نشون نده
    if (!postId) return null;

    // ✅ حالت لودینگ
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                <div className="bg-card rounded-2xl p-8 shadow-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    // ✅ حالت خطا یا پست پیدا نشد
    if (error || !data?.getPost) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                <div className="bg-card rounded-2xl p-8 shadow-xl max-w-md w-full text-center relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 p-1 hover:bg-border rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-5xl mb-4">❌</div>
                    <h2 className="text-lg font-bold text-primary mb-2">پست یافت نشد</h2>
                    <p className="text-sm text-secondary">
                        {error?.message || 'این پست حذف شده یا در دسترس نیست.'}
                    </p>
                </div>
            </div>
        );
    }

    // ✅ نمایش مودال پست با فرم کامنت
    return (
        <ViewPostModal
            post={data.getPost}
            isOpen={true}
            onClose={handleClose}
        >
            {({ postId, onCommentAdded }) => (
                <CommentForm
                    postId={postId}
                    onCommentAdded={onCommentAdded}
                />
            )}
        </ViewPostModal>
    );
};