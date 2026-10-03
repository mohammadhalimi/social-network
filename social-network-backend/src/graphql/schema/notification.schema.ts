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

  type ActionResponse {
    success: Boolean!
    message: String!
  }

  type UpdatePrivacyResponse {
    success: Boolean!
    message: String!
    isPrivate: Boolean!
  }

  type Query {
    getNotifications(limit: Int, offset: Int): NotificationsResult!
  }

  type Mutation {
    updatePrivacy(isPrivate: Boolean!): UpdatePrivacyResponse!
    markNotificationRead(notificationId: ID!): ActionResponse!
    markAllNotificationsRead: ActionResponse!
    acceptFollowRequest(requestId: ID!): ActionResponse!
    rejectFollowRequest(requestId: ID!): ActionResponse!
    cancelFollowRequest(targetUserId: ID!): ActionResponse!
  }
`;