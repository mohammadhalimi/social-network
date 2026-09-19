// components/profile/posts/PostItem/types.ts

export interface PostPreviewData {
    headerText: string;
    previewText: string;
    previewImage: string | null;
    previewVideo: string | null;
}

export interface PostItemProps {
    post: any;
    onDelete: (postId: string) => void;
    onEdit: (post: any) => void;
    onView: (post: any) => void;
}

export interface PostCommentPreview {
    id: string;
    content: string;
    user: {
        id: string;
        username: string;
        fullName: string;
        avatar: string | null;
    };
}