import { gql } from '@apollo/client';

// ✅ کوئری دریافت پست‌ها (Feed)
export const GET_FEED = gql`
  query GetFeed {
    feed {
      id
      content
      image
      createdAt
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
`;


// ✅ Mutation لایک کردن پست
export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      success
      message
      likesCount
      isLiked
    }
  }
`;

// ✅ کوئری دریافت اطلاعات کاربر (me)
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      fullName
      bio
      avatar
      createdAt
      updatedAt
    }
  }
`;