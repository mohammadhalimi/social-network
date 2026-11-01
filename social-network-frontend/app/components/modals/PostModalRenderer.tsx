'use client';

import {
    Loader2,
    X
} from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { closePostModal } from '@/app/redux/uiSlice';
import { GET_POST_BY_ID } from '@/app/graphql/post.queries';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { CommentForm } from '@/app/components/UserName/CommentForm';
import { ViewPostModal } from '@/app/components/profile/posts/ViewPostModal';

export const PostModalRenderer = () => {
    const dispatch = useAppDispatch();
    const postId = useAppSelector((state) => state.ui.postModalId);
    /// console.log('🎬 PostModalRenderer render, postId:', postId);

    // ✅ فقط وقتی postId وجود داره، Query بزن
    const { data, loading, error } = useQuery(GET_POST_BY_ID, {
        variables: { postId: postId || '' },
        skip: !postId,
        fetchPolicy: 'network-only',
    });
    /// console.log('🎬 Query result:', { loading, hasData: !!data?.getPost, error });

    const handleClose = () => {
        dispatch(closePostModal());
    };

    // ✅ اگر postId نیست، هیچی نشون نده
    if (!postId) return null;

    // ✅ حالت لودینگ
    if (loading) {
        return (
            <div
                data-testid="modal-loading"
                className="
                fixed
                inset-0
                bg-black/50
                flex
                items-center
                justify-center
                z-[100]
                p-4
            ">
                <div
                    className="
                    bg-card
                    rounded-2xl
                    p-8
                    shadow-xl
                ">
                    <Loader2
                        className="
                        w-8
                        h-8
                        animate-spin
                        text-primary
                    "/>
                </div>
            </div>
        );
    }

    // ✅ حالت خطا یا پست پیدا نشد
    if (error || !data?.getPost) {
        return (
            <div
                data-testid="modal-error"
                className="
                fixed
                inset-0
                bg-black/50
                flex
                items-center
                justify-center
                z-[100]
                p-4
            ">
                <div
                    className="
                    bg-card
                    rounded-2xl
                    p-8
                    shadow-xl
                    max-w-md
                    w-full
                    text-center
                    relative
                ">
                    <button
                        onClick={handleClose}
                        data-testid="modal-close-btn"
                        className="
                        absolute
                        top-4
                        left-4
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors
                        cursor-pointer
                        ">
                        <X
                            size={20}
                        />
                    </button>
                    <div
                        className="
                        text-5xl
                        mb-4
                    ">
                        ❌
                    </div>
                    <h1
                        className="
                        text-lg
                        font-bold
                        text-primary
                        mb-2
                    ">
                        پست یافت نشد
                    </h1>
                    <p
                        className="
                        text-sm
                        text-secondary
                    ">
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