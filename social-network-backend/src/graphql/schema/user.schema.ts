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
  }
`;