'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_POSTS } from '@/app/graphql/post.queries';
import { PostItem } from './PostItem';
import { useState } from 'react';

interface PostListProps {
  userId: string;
  onCommentClick: (postId: string) => void;
}

export const PostList = ({ userId, onCommentClick }: PostListProps) => {
  const [limit] = useState(10);
  const [offset] = useState(0);

  const { data, loading, error } = useQuery(GET_USER_POSTS, {
    variables: { userId, limit, offset },
    fetchPolicy: 'network-only',
    skip: !userId,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>خطا در دریافت پست‌ها</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  const posts = data?.getUserPosts || [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>هنوز پستی منتشر نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostItem
          key={post.id}
          post={post}
          onCommentClick={onCommentClick}
        />
      ))}
    </div>
  );
};