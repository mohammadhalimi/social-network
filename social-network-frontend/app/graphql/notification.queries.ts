// src/app/graphql/notification.queries.ts
import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

// =============================================
// ✅ Types & Interfaces
// =============================================

export type NotificationType = 'FOLLOW' | 'FOLLOW_REQUEST' | 'FOLLOW_REQUEST_ACCEPTED';
export type FollowRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface IUserBasic {
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
}

export interface IFollowRequest {
  id: string;
  status: FollowRequestStatus;
  createdAt: string;
  requester: IUserBasic;
  target: IUserBasic;
}

export interface INotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actor: IUserBasic;
  followRequest: IFollowRequest | null;
}

export interface INotificationsResult {
  notifications: INotification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
}

// =============================================
// ✅ Query: دریافت نوتیف‌ها
// =============================================

export interface GetNotificationsResponse {
  getNotifications: INotificationsResult;
}

export interface GetNotificationsVariables {
  limit?: number;
  offset?: number;
}

export const GET_NOTIFICATIONS: TypedDocumentNode<GetNotificationsResponse, GetNotificationsVariables> = gql`
  query GetNotifications($limit: Int, $offset: Int) {
    getNotifications(limit: $limit, offset: $offset) {
      notifications {
        id
        type
        isRead
        createdAt
        actor {
          id
          username
          fullName
          avatar
        }
        followRequest {
          id
          status
          createdAt
          requester {
            id
            username
            fullName
            avatar
          }
          target {
            id
            username
            fullName
            avatar
          }
        }
      }
      unreadCount
      totalCount
      hasMore
    }
  }
`;

// =============================================
// ✅ Query: درخواست‌های فالوی در انتظار
// =============================================

export interface GetPendingFollowRequestsResponse {
  getPendingFollowRequests: INotificationsResult;
}

export const GET_PENDING_FOLLOW_REQUESTS: TypedDocumentNode<
  GetPendingFollowRequestsResponse,
  GetNotificationsVariables
> = gql`
  query GetPendingFollowRequests($limit: Int, $offset: Int) {
    getPendingFollowRequests(limit: $limit, offset: $offset) {
      notifications {
        id
        type
        isRead
        createdAt
        actor {
          id
          username
          fullName
          avatar
        }
        followRequest {
          id
          status
          createdAt
          requester {
            id
            username
            fullName
            avatar
          }
          target {
            id
            username
            fullName
            avatar
          }
        }
      }
      unreadCount
      totalCount
      hasMore
    }
  }
`;

// =============================================
// ✅ Mutation: خوانده‌کردن یک نوتیف
// =============================================

export interface MarkNotificationReadResponse {
  markNotificationRead: {
    success: boolean;
    message: string;
  };
}

export interface MarkNotificationReadVariables {
  notificationId: string;
}

export const MARK_NOTIFICATION_READ: TypedDocumentNode<
  MarkNotificationReadResponse,
  MarkNotificationReadVariables
> = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      success
      message
    }
  }
`;

// =============================================
// ✅ Mutation: خوانده‌کردن همه‌ی نوتیف‌ها
// =============================================

export interface MarkAllNotificationsReadResponse {
  markAllNotificationsRead: {
    success: boolean;
    message: string;
  };
}

export const MARK_ALL_NOTIFICATIONS_READ: TypedDocumentNode<
  MarkAllNotificationsReadResponse,
  {}
> = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;

// =============================================
// ✅ Mutation: قبول درخواست فالو
// =============================================

export interface AcceptFollowRequestResponse {
  acceptFollowRequest: {
    success: boolean;
    message: string;
  };
}

export interface AcceptFollowRequestVariables {
  requestId: string;
}

export const ACCEPT_FOLLOW_REQUEST: TypedDocumentNode<
  AcceptFollowRequestResponse,
  AcceptFollowRequestVariables
> = gql`
  mutation AcceptFollowRequest($requestId: ID!) {
    acceptFollowRequest(requestId: $requestId) {
      success
      message
    }
  }
`;

// =============================================
// ✅ Mutation: رد درخواست فالو
// =============================================

export interface RejectFollowRequestResponse {
  rejectFollowRequest: {
    success: boolean;
    message: string;
  };
}

export interface RejectFollowRequestVariables {
  requestId: string;
}

export const REJECT_FOLLOW_REQUEST: TypedDocumentNode<
  RejectFollowRequestResponse,
  RejectFollowRequestVariables
> = gql`
  mutation RejectFollowRequest($requestId: ID!) {
    rejectFollowRequest(requestId: $requestId) {
      success
      message
    }
  }
`;

// =============================================
// ✅ Mutation: تغییر وضعیت خصوصی/عمومی
// =============================================

export interface UpdatePrivacyResponse {
  updatePrivacy: {
    success: boolean;
    message: string;
    isPrivate: boolean;
  };
}

export interface UpdatePrivacyVariables {
  isPrivate: boolean;
}

export const UPDATE_PRIVACY: TypedDocumentNode<
  UpdatePrivacyResponse,
  UpdatePrivacyVariables
> = gql`
  mutation UpdatePrivacy($isPrivate: Boolean!) {
    updatePrivacy(isPrivate: $isPrivate) {
      success
      message
      isPrivate
    }
  }
`;

// =============================================
// ✅ Mutation: CANCEL_FOLLOW_REQUEST
// =============================================


export interface CancelFollowRequestResponse {
  cancelFollowRequest: {
    success: boolean;
    message: string;
  };
}

export interface CancelFollowRequestVariables {
  targetUserId: string;
}

export const CANCEL_FOLLOW_REQUEST: TypedDocumentNode<
  CancelFollowRequestResponse,
  CancelFollowRequestVariables
> = gql`
  mutation CancelFollowRequest($targetUserId: ID!) {
    cancelFollowRequest(targetUserId: $targetUserId) {
      success
      message
    }
  }
`;