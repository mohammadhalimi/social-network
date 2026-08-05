import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// ✅ نوع‌های Register
export interface RegisterResponse {
  register: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      bio: string | null;
      avatar: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    token: string; // ✅ اضافه کردن token
  };
}

export interface RegisterVariables {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

// ✅ نوع‌های Login
export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      bio: string | null;
      avatar: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    token: string; // ✅ اضافه کردن token
  };
}

export interface LoginVariables {
  email: string;
  password: string;
}

// ✅ نوع‌های Logout
export interface LogoutResponse {
  logout: {
    success: boolean;
    message: string;
  };
}

// ✅ Mutation ثبت‌نام
export const REGISTER: TypedDocumentNode<RegisterResponse, RegisterVariables> = gql`
  mutation Register($email: String!, $username: String!, $password: String!, $fullName: String!) {
    register(email: $email, username: $username, password: $password, fullName: $fullName) {
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
      token
    }
  }
`;

// ✅ Mutation ورود
export const LOGIN: TypedDocumentNode<LoginResponse, LoginVariables> = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
      token
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;