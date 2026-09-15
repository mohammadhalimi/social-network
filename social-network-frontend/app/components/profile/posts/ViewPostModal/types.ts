// components/profile/posts/ViewPostModal/types.ts

export interface PostCommentUser {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
}

export interface PostReply {
    id: string;
    content: string;
    createdAt: string;
    user: PostCommentUser;
}

export interface PostComment {
    id: string;
    content: string;
    createdAt: string;
    user: PostCommentUser;
    replies?: PostReply[];
}

// ✅ تایپ برای پراپ‌های ViewPostModal
export interface ViewPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    children?: (opts: {
        postId: string;
        onCommentAdded: (comment: PostComment) => void;
    }) => React.ReactNode;
}