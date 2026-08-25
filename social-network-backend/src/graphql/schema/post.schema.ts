export const postTypeDefs = `
  type Post {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    isPublished: Boolean!
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    post: Post!
    parentId: ID
    parent: Comment
    replies: [Comment!]!
    likesCount: Int!
    isLiked: Boolean!
  }

  type LikeResponse {
    success: Boolean!
    message: String!
    isLiked: Boolean!
  }

  type CommentResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }

  type PostResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type Query {
    getPost(postId: ID!): Post
    getUserPosts(userId: String!, limit: Int, offset: Int): [Post!]!
    getFeed(limit: Int, offset: Int): [Post!]!
  }

  type Mutation {
    createPost(content: String!): PostResponse!
    updatePost(postId: ID!, content: String!): PostResponse!
    deletePost(postId: ID!): PostResponse!
    
    likePost(postId: ID!): LikeResponse!
    unlikePost(postId: ID!): LikeResponse!
    
    commentOnPost(postId: ID!, content: String!): CommentResponse!
    replyToComment(commentId: ID!, content: String!): CommentResponse!
    deleteComment(commentId: ID!): CommentResponse!
    
    likeComment(commentId: ID!): LikeResponse!
    unlikeComment(commentId: ID!): LikeResponse!
  }
`;