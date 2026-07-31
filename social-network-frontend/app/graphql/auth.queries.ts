import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// ✅ ۱. تعریف نوع‌ها
export interface RegisterResponse {
  register: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
    } | null;
  };
}

export interface RegisterVariables {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
    } | null;
  };
}

export interface LoginVariables {
  email: string;
  password: string;
}

// ✅ ۲. تعریف Mutationها با نوع
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
      }
    }
  }
`;

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
      }
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