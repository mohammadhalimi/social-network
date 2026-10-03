export const userTypeDefs = `
  type User {
    id: ID!
    email: String!
    username: String!
    fullName: String!
    bio: String
    avatar: String
    createdAt: String!
    updatedAt: String!
    followersCount: Int!
    followingCount: Int!
    isFollowing: Boolean!
    isPrivate: Boolean!
    isFollowRequestPending: Boolean!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type UpdateProfilePayload {
    success: Boolean!
    message: String!
    user: User
  }

  type SearchUsersResult {
    users: [User!]!
    totalCount: Int!
    hasMore: Boolean!
  } 

  # ✅ فقط یک‌بار تعریف شده، با isPending
  type FollowResponse {
    success: Boolean!
    message: String!
    isFollowing: Boolean!
    isPending: Boolean!
    followersCount: Int!
  }

  type Mutation {
    register(
      email: String!
      username: String!
      password: String!
      fullName: String!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    logout: LogoutPayload!

    updateProfile(
      username: String
      fullName: String
      email: String
      bio: String
      avatar: String
    ): UpdateProfilePayload!

    changePassword(
      oldPassword: String!
      newPassword: String!
    ): UpdateProfilePayload!

    requestPasswordReset(email: String!): ResetPasswordPayload!
    resetPassword(token: String!, newPassword: String!): ResetPasswordPayload!

    followUser(userId: ID!): FollowResponse!
    unfollowUser(userId: ID!): FollowResponse!
  }

  type LogoutPayload {
    success: Boolean!
    message: String!
  }

  type Query {
    _empty: String
    me: User
    searchUsers(searchTerm: String!, limit: Int = 10, offset: Int = 0): SearchUsersResult!
    getUserByUsername(username: String!): User
    getFollowers(userId: ID!, searchTerm: String, limit: Int, offset: Int): UserConnection!
    getFollowing(userId: ID!, searchTerm: String, limit: Int, offset: Int): UserConnection!
  }

  type ResetPasswordPayload {
    success: Boolean!
    message: String!
  }

  type UserConnection {
    users: [User!]!
    totalCount: Int!
    hasMore: Boolean!
  }
`;