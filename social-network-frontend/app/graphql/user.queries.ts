import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// =============================================
//  ✅ نوع‌های SearchUsers
// =============================================
export interface SearchUsersResponse {
  searchUsers: {
    users: {
      id: string;
      username: string;
      fullName: string;
      bio: string | null;
      avatar: string | null;
    }[];
    totalCount: number;
    hasMore: boolean;
  };
}

export interface SearchUsersVariables {
  searchTerm: string;
  limit?: number;
  offset?: number;
}

// =============================================
//  ✅ نوع‌های GetUserByUsername
// =============================================
export interface GetUserByUsernameResponse {
  getUserByUsername: {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetUserByUsernameVariables {
  username: string;
}

// =============================================
//  ✅ کوئری‌ها
// =============================================

// ✅ کوئری جستجوی کاربران
export const SEARCH_USERS: TypedDocumentNode<SearchUsersResponse, SearchUsersVariables>  = gql`
  query SearchUsers($searchTerm: String!, $limit: Int, $offset: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit, offset: $offset) {
      users {
        id
        username
        fullName
        bio
        avatar
      }
      totalCount
      hasMore
    }
  }
`;

// ✅ کوئری دریافت کاربر با username
export const GET_USER_BY_USERNAME: TypedDocumentNode<GetUserByUsernameResponse, GetUserByUsernameVariables>   = gql`
  query GetUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      fullName
      bio
      avatar
      createdAt
      updatedAt
    }
  }
`;