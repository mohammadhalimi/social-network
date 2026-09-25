// app/graphql/story.queries.ts
import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export type StoryVisibility = 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS';
export type StoryDuration = 'SIX_HOURS' | 'TWELVE_HOURS' | 'EIGHTEEN_HOURS' | 'TWENTY_FOUR_HOURS';

export interface StoryUser {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
}

export interface StoryViewer {
    user: StoryUser;
    viewedAt: string;
}

export interface Story {
    id: string;
    user: StoryUser;
    mediaUrl: string;
    mediaType: string;
    visibility: StoryVisibility;
    createdAt: string;
    expiresAt: string;
    viewsCount: number;
    isViewedByMe: boolean;
    viewers: StoryViewer[];
}

// =============================================
// Mutation: ساخت استوری
// =============================================

export interface CreateStoryResponse {
    createStory: {
        success: boolean;
        message: string;
        story: Story | null;
    };
}

export interface CreateStoryVariables {
    mediaUrl: string;
    mediaType: string;
    duration: StoryDuration;
    visibility: StoryVisibility;
}

export const CREATE_STORY: TypedDocumentNode<CreateStoryResponse, CreateStoryVariables> = gql`
  mutation CreateStory($mediaUrl: String!, $mediaType: String!, $duration: StoryDuration!, $visibility: StoryVisibility!) {
    createStory(mediaUrl: $mediaUrl, mediaType: $mediaType, duration: $duration, visibility: $visibility) {
      success
      message
      story {
        id
        mediaUrl
        mediaType
        visibility
        createdAt
        expiresAt
        viewsCount
        isViewedByMe
        user {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
`;

// =============================================
// Mutation: حذف استوری
// =============================================

export interface DeleteStoryResponse {
    deleteStory: { success: boolean; message: string };
}

export interface DeleteStoryVariables {
    storyId: string;
}

export const DELETE_STORY: TypedDocumentNode<DeleteStoryResponse, DeleteStoryVariables> = gql`
  mutation DeleteStory($storyId: ID!) {
    deleteStory(storyId: $storyId) {
      success
      message
    }
  }
`;

// =============================================
// Mutation: ثبت مشاهده
// =============================================

export interface ViewStoryResponse {
    viewStory: { success: boolean; message: string };
}

export interface ViewStoryVariables {
    storyId: string;
}

export const VIEW_STORY: TypedDocumentNode<ViewStoryResponse, ViewStoryVariables> = gql`
  mutation ViewStory($storyId: ID!) {
    viewStory(storyId: $storyId) {
      success
      message
    }
  }
`;

// =============================================
// Query: استوری‌های یک کاربر خاص
// =============================================

export interface GetUserStoriesResponse {
    getUserStories: Story[];
}

export interface GetUserStoriesVariables {
    userId: string;
}

export const GET_USER_STORIES: TypedDocumentNode<GetUserStoriesResponse, GetUserStoriesVariables> = gql`
  query GetUserStories($userId: ID!) {
    getUserStories(userId: $userId) {
      id
      mediaUrl
      mediaType
      visibility
      createdAt
      expiresAt
      viewsCount
      isViewedByMe
      user {
        id
        username
        fullName
        avatar
      }
      viewers {
        viewedAt
        user {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
`;

// =============================================
// Query: استوری‌های فالووینگ‌ها (فید)
// =============================================

export interface GetFollowingStoriesResponse {
    getFollowingStories: Story[];
}

export const GET_FOLLOWING_STORIES: TypedDocumentNode<GetFollowingStoriesResponse, {}> = gql`
  query GetFollowingStories {
    getFollowingStories {
      id
      mediaUrl
      mediaType
      visibility
      createdAt
      expiresAt
      viewsCount
      isViewedByMe
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
// Query/Mutation: دوستان نزدیک
// =============================================

export interface GetCloseFriendsResponse {
    getCloseFriends: StoryUser[];
}

export const GET_CLOSE_FRIENDS: TypedDocumentNode<GetCloseFriendsResponse, {}> = gql`
  query GetCloseFriends {
    getCloseFriends {
      id
      username
      fullName
      avatar
    }
  }
`;

export interface AddCloseFriendResponse {
    addCloseFriend: { success: boolean; message: string; closeFriends: StoryUser[] };
}
export interface AddCloseFriendVariables {
    userId: string;
}

export const ADD_CLOSE_FRIEND: TypedDocumentNode<AddCloseFriendResponse, AddCloseFriendVariables> = gql`
  mutation AddCloseFriend($userId: ID!) {
    addCloseFriend(userId: $userId) {
      success
      message
      closeFriends {
        id
        username
        fullName
        avatar
      }
    }
  }
`;

export interface RemoveCloseFriendResponse {
    removeCloseFriend: { success: boolean; message: string; closeFriends: StoryUser[] };
}
export interface RemoveCloseFriendVariables {
    userId: string;
}

export const REMOVE_CLOSE_FRIEND: TypedDocumentNode<RemoveCloseFriendResponse, RemoveCloseFriendVariables> = gql`
  mutation RemoveCloseFriend($userId: ID!) {
    removeCloseFriend(userId: $userId) {
      success
      message
      closeFriends {
        id
        username
        fullName
        avatar
      }
    }
  }
`;