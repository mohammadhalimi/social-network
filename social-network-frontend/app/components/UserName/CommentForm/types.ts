
export interface CommentFormProps {
    postId: string;
    onCommentAdded: (comment: any) => void;
    // ✅ اگر این مقدار ست شود، یعنی داریم ریپلای می‌زنیم
    parentCommentId?: string | null;
    onCancelReply?: () => void;
}