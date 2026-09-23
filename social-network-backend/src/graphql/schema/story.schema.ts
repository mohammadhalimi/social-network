// schema/story.schema.ts
export const storyTypeDefs = `
  enum StoryVisibility {
    PUBLIC
    FOLLOWERS
    CLOSE_FRIENDS
  }

  enum StoryDuration {
    SIX_HOURS
    TWELVE_HOURS
    EIGHTEEN_HOURS
    TWENTY_FOUR_HOURS
  }

  type Story {
    id: ID!
    user: User!
    mediaUrl: String!
    mediaType: String!
    visibility: StoryVisibility!
    createdAt: String!
    expiresAt: String!
    viewsCount: Int!
    isViewedByMe: Boolean!
    viewers: [StoryViewer!]!
  }

  type StoryViewer {
    user: User!
    viewedAt: String!
  }

  type StoryResponse {
    success: Boolean!
    message: String!
    story: Story
  }

  type ViewStoryResponse {
    success: Boolean!
    message: String!
  }

  type CloseFriendResponse {
    success: Boolean!
    message: String!
    closeFriends: [User!]!
  }

  type Query {
    getUserStories(userId: ID!): [Story!]!
    getFollowingStories: [Story!]!
    getCloseFriends: [User!]!
  }

  type Mutation {
    createStory(mediaUrl: String!, mediaType: String!, duration: StoryDuration!, visibility: StoryVisibility!): StoryResponse!
    deleteStory(storyId: ID!): StoryResponse!
    viewStory(storyId: ID!): ViewStoryResponse!

    addCloseFriend(userId: ID!): CloseFriendResponse!
    removeCloseFriend(userId: ID!): CloseFriendResponse!
  }
`;