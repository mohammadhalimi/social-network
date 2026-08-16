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
// =============================================
//  نوع‌های RequestPasswordReset
// =============================================
export interface RequestPasswordResetResponse {
  requestPasswordReset: {
    success: boolean;
    message: string;
  };
}

export interface RequestPasswordResetVariables {
  email: string;
}

// =============================================
//  نوع‌های ResetPassword
// =============================================
export interface ResetPasswordResponse {
  resetPassword: {
    success: boolean;
    message: string;
  };
}

export interface ResetPasswordVariables {
  token: string;
  newPassword: string;
}

// =============================================
//  نوع‌های ValidateResetToken
// =============================================
export interface ValidateResetTokenResponse {
  validateResetToken: {
    valid: boolean;
  };
}

export interface ValidateResetTokenVariables {
  token: string;
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

// =============================================
//  Mutations و Queries با نوع
// =============================================
export const REQUEST_PASSWORD_RESET: TypedDocumentNode<
  RequestPasswordResetResponse,
  RequestPasswordResetVariables
> = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD: TypedDocumentNode<
  ResetPasswordResponse,
  ResetPasswordVariables
> = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const VALIDATE_RESET_TOKEN: TypedDocumentNode<
  ValidateResetTokenResponse,
  ValidateResetTokenVariables
> = gql`
  query ValidateResetToken($token: String!) {
    validateResetToken(token: $token) {
      valid
    }
  }
`;