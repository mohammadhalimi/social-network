import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// ✅ نوع پاسخ کوئری GET_PROFILE
export interface GetProfileResponse {
  me: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    bio: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

// =============================================
// ✅ ۱. کوئری دریافت اطلاعات کاربر (me)
// =============================================
export const GET_PROFILE: TypedDocumentNode<GetProfileResponse> = gql`
  query GetProfile {
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

// =============================================
// ✅ ۲. Mutation ویرایش پروفایل
// =============================================
export interface UpdateProfileResponse {
  updateProfile: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      bio: string;
      avatar: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
}

export interface UpdateProfileVariables {
  username?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export const UPDATE_PROFILE: TypedDocumentNode<UpdateProfileResponse, UpdateProfileVariables> = gql`
  mutation UpdateProfile(
    $username: String
    $fullName: String
    $email: String
    $bio: String
    $avatar: String
  ) {
    updateProfile(
      username: $username
      fullName: $fullName
      email: $email
      bio: $bio
      avatar: $avatar
    ) {
      success
      message
      user {
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
  }
`;

// =============================================
// ✅ ۳. Mutation تغییر رمز عبور
// =============================================
export interface ChangePasswordResponse {
  changePassword: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      bio: string;
      avatar: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
}

export interface ChangePasswordVariables {
  oldPassword: string;
  newPassword: string;
}

export const CHANGE_PASSWORD: TypedDocumentNode<ChangePasswordResponse, ChangePasswordVariables> = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
      user {
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
  }
`;