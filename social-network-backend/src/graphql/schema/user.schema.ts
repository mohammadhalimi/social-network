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
  }

  type LogoutPayload {
    success: Boolean!
    message: String!
  }
    
  type Query {
  _empty: String
  me: User   # ✅ اضافه کردن
  }

  type ResetPasswordPayload {
    success: Boolean!
    message: String!
  }
`;