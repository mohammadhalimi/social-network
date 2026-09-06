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
    
  type FollowResponse {
    success: Boolean!
    message: String!
    isFollowing: Boolean!
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

    # ✅ Mutation جدید برای ویرایش پروفایل
    updateProfile(
      username: String
      fullName: String
      email: String
      bio: String
      avatar: String
    ): UpdateProfilePayload!

    # ✅ Mutation جدید برای تغییر رمز عبور
    changePassword(
      oldPassword: String!
      newPassword: String!
    ): UpdateProfilePayload!

    # ✅ درخواست بازیابی رمز
    requestPasswordReset(email: String!): ResetPasswordPayload!

    # ✅ بازنشانی رمز با توکن
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
  me: User   # ✅ اضافه کردن
  searchUsers(searchTerm: String!, limit: Int = 10, offset: Int = 0): SearchUsersResult!
    
    # ✅ کوئری جدید برای دریافت کاربر با username
    getUserByUsername(username: String!): User
  }

  type ResetPasswordPayload {
    success: Boolean!
    message: String!
  }
`;