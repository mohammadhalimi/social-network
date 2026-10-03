export const notificationTypeDefs = `
  enum FollowRequestStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  enum NotificationType {
    FOLLOW
    FOLLOW_REQUEST
    FOLLOW_REQUEST_ACCEPTED
  }

  type FollowRequest {
    id: ID!
    requester: User!
    target: User!
    status: FollowRequestStatus!
    createdAt: String!
  }

  type Notification {
    id: ID!
    actor: User!
    type: NotificationType!
    isRead: Boolean!
    followRequest: FollowRequest
    createdAt: String!
  }

  type NotificationsResult {
    notifications: [Notification!]!
    unreadCount: Int!
    totalCount: Int!
    hasMore: Boolean!
  }

  type FollowRequestResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    getNotifications(limit: Int, offset: Int): NotificationsResult!
    getPendingFollowRequests(limit: Int, offset: Int): NotificationsResult!
  }

  type Mutation {
    markNotificationRead(notificationId: ID!): FollowRequestResponse!
    markAllNotificationsRead: FollowRequestResponse!
    acceptFollowRequest(requestId: ID!): FollowRequestResponse!
    rejectFollowRequest(requestId: ID!): FollowRequestResponse!
    cancelFollowRequest(targetUserId: ID!): FollowRequestResponse!
  }
`;