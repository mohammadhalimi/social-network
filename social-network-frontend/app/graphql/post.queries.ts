// posts.graphql.ts
import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// =============================================
// ✅ Types & Interfaces
// =============================================

export interface IUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
}

export interface IPost {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isPublished?: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  user: IUser;
}

export interface IComment {
  id: string;
  content: string;
  createdAt: string;
  user: IUser;
  likesCount: number;
  isLiked: boolean;
}

// =============================================
// ✅ ۱. کوئری دریافت پست‌های کاربر
// =============================================

export interface GetUserPostsResponse {
  getUserPosts: IPost[];
}

export interface GetUserPostsVariables {
  userId: string;
  limit?: number | null;
  offset?: number | null;
}

export const GET_USER_POSTS: TypedDocumentNode<GetUserPostsResponse, GetUserPostsVariables> = gql`
  query GetUserPosts($userId: String!, $limit: Int, $offset: Int) {
    getUserPosts(userId: $userId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      updatedAt
      isPublished
      likesCount
      commentsCount
      isLiked
      user {
        id
        username
        fullName
        avatar
      }
    }
  }
`;

// =============================================
// ✅ ۲. Mutation ایجاد پست جدید
// =============================================

export interface CreatePostResponse {
  createPost: {
    success: boolean;
    message: string;
    post: IPost;
  };
}

export interface CreatePostVariables {
  content: string;
}

export const CREATE_POST: TypedDocumentNode<CreatePostResponse, CreatePostVariables> = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      success
      message
      post {
        id
        content
        createdAt
        user {
          id
          username
          fullName
        }
        likesCount
        commentsCount
        isLiked
      }
    }
  }
`;

// =============================================
// ✅ ۳. Mutation لایک کردن پست
// =============================================

export interface LikePostResponse {
  likePost: {
    success: boolean;
    message: string;
    isLiked: boolean;
  };
}

export interface LikePostVariables {
  postId: string;
}

export const LIKE_POST: TypedDocumentNode<LikePostResponse, LikePostVariables> = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      success
      message
      isLiked
    }
  }
`;

// =============================================
// ✅ ۴. Mutation آنلایک کردن پست
// =============================================

export interface UnlikePostResponse {
  unlikePost: {
    success: boolean;
    message: string;
    isLiked: boolean;
  };
}

export interface UnlikePostVariables {
  postId: string;
}

export const UNLIKE_POST: TypedDocumentNode<UnlikePostResponse, UnlikePostVariables> = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      success
      message
      isLiked
    }
  }
`;

// =============================================
// ✅ ۵. Mutation کامنت گذاشتن
// =============================================

export interface CommentOnPostResponse {
  commentOnPost: {
    success: boolean;
    message: string;
    comment: IComment;
  };
}

export interface CommentOnPostVariables {
  postId: string;
  content: string;
}

export const COMMENT_ON_POST: TypedDocumentNode<CommentOnPostResponse, CommentOnPostVariables> = gql`
  mutation CommentOnPost($postId: ID!, $content: String!) {
    commentOnPost(postId: $postId, content: $content) {
      success
      message
      comment {
        id
        content
        createdAt
        user {
          id
          username
          fullName
          avatar
        }
        likesCount
        isLiked
      }
    }
  }
`;

// =============================================
// ✅ ۶. Mutation ویرایش پست
// =============================================

export interface UpdatePostResponse {
  updatePost: {
    success: boolean;
    message: string;
    post: IPost;
  };
}

export interface UpdatePostVariables {
  postId: string;
  content: string;
}

export const UPDATE_POST: TypedDocumentNode<UpdatePostResponse, UpdatePostVariables> = gql`
  mutation UpdatePost($postId: ID!, $content: String!) {
    updatePost(postId: $postId, content: $content) {
      success
      message
      post {
        id
        content
        createdAt
        updatedAt
        user {
          id
          username
          fullName
          avatar
        }
        likesCount
        commentsCount
        isLiked
      }
    }
  }
`;

// =============================================
// ✅ ۷. Mutation حذف پست
// =============================================

export interface DeletePostResponse {
  deletePost: {
    success: boolean;
    message: string;
  };
}

export interface DeletePostVariables {
  postId: string;
}

export const DELETE_POST: TypedDocumentNode<DeletePostResponse, DeletePostVariables> = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      success
      message
    }
  }
`;