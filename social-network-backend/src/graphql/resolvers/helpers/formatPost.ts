import { mapUser } from './mapUser';

export const formatPost = (post: any, userId?: string) => {
  const likes = post.likes || [];
  const comments = post.comments || [];

  return {
    ...post,
    createdAt: new Date(post.createdAt).toISOString(),   // 👈 اضافه شد
    updatedAt: new Date(post.updatedAt).toISOString(),   // 👈 اضافه شد
    user: mapUser(post.user),
    likesCount: likes.length,
    commentsCount: comments.length,
    isLiked: userId ? likes.some((like: any) => like.userId === userId) : false,
    comments: comments.map((comment: any) => formatComment(comment, userId)),
  };
};

export const formatComment = (comment: any, userId?: string) => {
  const likes = comment.likes || [];
  const replies = comment.replies || [];

  return {
    ...comment,
    createdAt: new Date(comment.createdAt).toISOString(),   // 👈 اضافه شد
    updatedAt: new Date(comment.updatedAt).toISOString(),   // 👈 اضافه شد
    user: mapUser(comment.user),
    likesCount: likes.length,
    isLiked: userId ? likes.some((like: any) => like.userId === userId) : false,
    replies: replies.map((reply: any) => formatComment(reply, userId)),
  };
};