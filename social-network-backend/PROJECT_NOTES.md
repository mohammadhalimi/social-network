# Backend Project Notes — Social Network

## Overview
Instagram-like social network backend API, built with **Layered Architecture**.

## Architecture: Layered
┌─────────────────────────────────────────────────────────┐
│ Presentation Layer │
│ (GraphQL Resolvers, Routes, Socket.IO Handlers) │
│ - graphql/resolvers/* │
│ - routes/* │
│ - socket/index.ts │
└─────────────────────────┬───────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Service Layer │
│ (Business Logic, Orchestration) │
│ - services/* │
│ - modules/auth/auth.service.ts │
│ - modules/profile/profile.service.ts │
└─────────────────────────┬───────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Data Access Layer │
│ (Database, Prisma, External I/O) │
│ - lib/prisma.ts │
│ - prisma/schema.prisma │
│ - graphql/resolvers/helpers/* (formatters, mappers) │
└─────────────────────────┬───────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Database │
│ (PostgreSQL via Prisma 7) │
└─────────────────────────────────────────────────────────┘


### Layer Responsibilities

| Layer | Responsibility | Location |
| :--- | :--- | :--- |
| **Presentation** | HTTP/GraphQL/Socket entry points. Validates input, calls services. No business logic. | `graphql/resolvers`, `routes`, `socket` |
| **Service** | Business logic, orchestration, transactions. Calls data access. | `services`, `modules/*` |
| **Data Access** | Prisma client, DB queries, data transformation. | `lib/prisma`, `helpers`, `prisma/schema` |
| **Cross-Cutting** | Auth, notifications, file upload, jobs. | `try-catch`, `helpers/notify`, `jobs` |

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **GraphQL:** graphql-http + @graphql-tools/schema
- **Database:** PostgreSQL + Prisma 7 (with @prisma/adapter-pg)
- **Real-time:** socket.io
- **Auth:** JWT + bcryptjs
- **File Upload:** multer
- **Cron Jobs:** node-cron
- **Dev Tools:** tsx + nodemon
- **Testing:** Jest + ts-jest
- **Faker:** @faker-js/faker (seeding)

## Project Structure

### Root
- `prisma/`
  - `schema.prisma` — Database models
  - `migrations/` — Migration history
- `src/`
  - `index.ts` — Application entry point
  - `env.ts` — Environment loader
  - `seed.ts` — Database seeding script
  - `prisma.config.ts` — Prisma configuration
  - `jest.config.js` — Jest configuration
- `uploads/`
  - `posts/` — Post media
  - `stories/` — Story media
  - `*.jpg/png` — User avatars

### Presentation Layer

#### `src/graphql/`
- `schema/`
  - `user.schema.ts`
  - `post.schema.ts`
  - `story.schema.ts`
  - `notification.schema.ts`
- `resolvers/`
  - `user.resolvers.ts` — Merges user resolvers
  - `post.resolvers.ts` — Merges post resolvers
  - `story.resolvers.ts` — Merges story resolvers
  - `notification.resolvers.ts` — Merges notification resolvers
  - `user/`
    - `user.queries.ts`
    - `auth.resolvers.ts`
    - `follow.resolvers.ts`
    - `profile.resolvers.ts`
    - `privacy.resolvers.ts`
    - `__tests__/`
  - `post/`
    - `post.queries.ts`
    - `post.mutations.ts`
    - `like.resolvers.ts`
    - `comment.resolvers.ts`
    - `__tests__/`
  - `story/`
    - `story.queries.ts`
    - `story.mutations.ts`
    - `__tests__/`
  - `notification/`
    - `notification.queries.ts`
    - `notification.mutations.ts`

#### `src/routes/`
- `upload.route.ts` — POST /upload-avatar
- `post-media.route.ts` — POST /upload-post-media, DELETE /delete-post-media
- `story-media.route.ts` — POST /upload-story-media, DELETE /delete-story-media
- `__tests__/`

#### `src/socket/`
- `index.ts` — Socket.IO init + `emitToUser` helper

### Service Layer

#### `src/services/`
- `upload.service.ts` — Avatar upload
- `post-media.service.ts` — Post media upload
- `story-media.service.ts` — Story media upload
- `story-cleanup.service.ts` — Expired story cleanup
- `__tests__/`

#### `src/modules/`
- `auth/`
  - `auth.service.ts`
  - `__tests__/auth.service.test.ts`
- `profile/`
  - `profile.service.ts`
  - `__tests__/profile.service.test.ts`

### Data Access Layer

#### `src/lib/`
- `prisma.ts` — Prisma client singleton

#### `src/graphql/resolvers/helpers/`
- `mapUser.ts` — Prisma User → GraphQL User
- `formatPost.ts` — Prisma Post → GraphQL Post (with likesCount, isLiked, etc.)
- `notify.ts` — Creates notifications + emits socket events
- `checkStoryAccess.ts` — Story visibility check
- `checkProfileAccess.ts` — Private profile access check
- `storyDuration.ts` — Duration enum → hours/Date
- `response.ts` — Response helpers
- `__tests__/`

### Cross-Cutting Concerns

#### `src/graphql/resolvers/try-catch/`
- `requireAuth.ts` — Auth guard (throws if no user)
- `__test__/requireAuth.test.ts`

#### `src/jobs/`
- `storyCleanupJob.ts` — Runs hourly + once on startup

#### `src/types/`
- `express.d.ts` — Express type extensions
- `env.ts` — Env type definitions

## Request Flow (Example: likePost)
1.Client sends mutation likePost(postId)
↓

2.[Presentation] like.resolvers.ts ← likePost

....Calls requireAuth(context) ← get userId

....Calls prisma.post.findUnique ← check post exists

....Calls prisma.like.findUnique ← check existing like

....Calls prisma.like.create ← create like

....Calls createNotification (helper) ← notify post owner
↓

3.[Data Access] prisma.like.create

....Prisma Client executes SQL

....PostgreSQL stores record
↓

4.[Cross-Cutting] createNotification

....prisma.notification.create

....emitToUser(recipientId, 'notification:new', payload)

....Socket.IO sends to recipient's sockets
↓

5.Response returned to client

## Database Models (Prisma)

### User
- Fields: id, email, username, password, fullName, bio, avatar, isPrivate, createdAt, updatedAt, resetToken, resetTokenExpiresAt
- Relations: posts, comments, likes, commentLikes, following, followers, stories, storyViews, closeFriendsOf, closeFriendedBy, sentFollowRequests, receivedFollowRequests, notificationsReceived, notificationsCaused

### Post
- Fields: id, content (JSON), userId, createdAt, updatedAt, isPublished
- Relations: user, comments, likes, notifications

### Comment
- Fields: id, content, userId, postId, parentId, createdAt, updatedAt
- Relations: user, post, parent, replies, likes, notifications

### Like
- Fields: id, userId, postId, createdAt
- Unique: [userId, postId]

### CommentLike
- Fields: id, userId, commentId, createdAt
- Unique: [userId, commentId]

### Follow
- Fields: id, followerId, followingId, createdAt
- Unique: [followerId, followingId]

### Story
- Fields: id, userId, mediaUrl, mediaType, visibility, createdAt, expiresAt
- Enum: StoryVisibility (PUBLIC, FOLLOWERS, CLOSE_FRIENDS)

### StoryView
- Fields: id, storyId, viewerId, viewedAt
- Unique: [storyId, viewerId]

### CloseFriend
- Fields: id, ownerId, friendId, createdAt
- Unique: [ownerId, friendId]

### FollowRequest
- Fields: id, requesterId, targetId, status, createdAt, updatedAt
- Enum: FollowRequestStatus (PENDING, ACCEPTED, REJECTED)
- Unique: [requesterId, targetId]

### Notification
- Fields: id, recipientId, actorId, type, isRead, followRequestId, postId, commentId, createdAt
- Enum: NotificationType (FOLLOW, FOLLOW_REQUEST, FOLLOW_REQUEST_ACCEPTED, LIKE, COMMENT, REPLY, COMMENT_LIKE)

## Implemented Features

### Auth (Service Layer: `modules/auth`)
- [x] register
- [x] login
- [x] logout
- [x] requestPasswordReset
- [x] resetPassword

### User (Presentation + Data Access)
- [x] me
- [x] searchUsers (priority: username startsWith > fullName startsWith > contains)
- [x] getUserByUsername (includes isPrivate, isFollowRequestPending)
- [x] getFollowers
- [x] getFollowing
- [x] updateProfile
- [x] changePassword
- [x] updatePrivacy

### Follow System
- [x] followUser (public → direct, private → FollowRequest)
- [x] unfollowUser
- [x] cancelFollowRequest
- [x] acceptFollowRequest
- [x] rejectFollowRequest

### Post
- [x] createPost, updatePost, deletePost
- [x] getUserPosts (with private profile check)
- [x] getPost (with private profile check)
- [x] getFeed (with private profile filter)

### Comment
- [x] commentOnPost (with notification)
- [x] replyToComment (with notification)
- [x] deleteComment
- [x] getPostComments

### Like
- [x] likePost (with notification)
- [x] unlikePost
- [x] likeComment (with notification)
- [x] unlikeComment

### Story
- [x] createStory (validates mediaType, visibility, duration, mediaUrl)
- [x] deleteStory
- [x] viewStory (with StoryView upsert)
- [x] getUserStories (private profile check)
- [x] getFollowingStories (close friend filter)
- [x] getCloseFriends
- [x] addCloseFriend
- [x] removeCloseFriend

### Notification (Cross-Cutting)
- [x] getNotifications
- [x] getPendingFollowRequests
- [x] markNotificationRead
- [x] markAllNotificationsRead
- [x] createNotification helper (skip self, skip duplicate LIKE/COMMENT_LIKE)
- [x] Real-time via Socket.IO `notification:new`

### File Upload (Service Layer)
- [x] Avatar (max 5MB)
- [x] Post media (max 50MB)
- [x] Story media (max 50MB)

### Jobs (Cross-Cutting)
- [x] storyCleanupJob — hourly + on startup

## Tests Written

### Helpers
- [x] `checkStoryAccess.test.ts`
- [x] `formatPost.test.ts`
- [x] `mapUser.test.ts`
- [x] `response.test.ts`
- [x] `storyDuration.test.ts`
- [x] `notify.test.ts`
- [ ] `checkProfileAccess.test.ts` (TODO)

### User Resolvers
- [x] `auth.resolvers.test.ts`
- [x] `follow.resolvers.test.ts`
- [x] `profile.resolvers.test.ts`
- [x] `user.queries.test.ts`
- [x] `requireAuth.test.ts`
- [x] `privacy.resolvers.test.ts`

### Post Resolvers
- [x] `comment.resolvers.test.ts`
- [x] `like.resolvers.test.ts`
- [x] `post.mutations.test.ts`
- [x] `post.queries.test.ts`

### Story Resolvers
- [x] `story.mutations.test.ts`
- [x] `story.queries.test.ts`

### Notification Resolvers
- [x] `notification.queries.test.ts`
- [x] `notification.mutations.test.ts`

### Services
- [x] `post-media.service.test.ts`
- [x] `story-cleanup.service.test.ts`
- [x] `story-media.service.test.ts`
- [x] `upload.test.ts`

### Routes
- [x] `post-media.route.test.ts`
- [x] `story-media.route.test.ts`

### Modules
- [x] `auth.service.test.ts`
- [x] `profile.service.test.ts`

### Socket
- [x] `socket/index.test.ts`

### Helpers (Data Access)
- [x] `checkStoryAccess.test.ts`
- [x] `formatPost.test.ts`
- [x] `mapUser.test.ts`
- [x] `response.test.ts`
- [x] `storyDuration.test.ts`

### User Resolvers (Presentation)
- [x] `auth.resolvers.test.ts`
- [x] `follow.resolvers.test.ts`
- [x] `profile.resolvers.test.ts`
- [x] `user.queries.test.ts`
- [x] `requireAuth.test.ts`

### Post Resolvers (Presentation)
- [x] `comment.resolvers.test.ts`
- [x] `like.resolvers.test.ts`
- [x] `post.mutations.test.ts`
- [x] `post.queries.test.ts`

### Story Resolvers (Presentation)
- [x] `story.mutations.test.ts`
- [x] `story.queries.test.ts`

### Services (Service Layer)
- [x] `post-media.service.test.ts`
- [x] `story-cleanup.service.test.ts`
- [x] `story-media.service.test.ts`
- [x] `upload.test.ts`

### Routes (Presentation)
- [x] `post-media.route.test.ts`
- [x] `story-media.route.test.ts`

### Modules (Service Layer)
- [x] `auth.service.test.ts`
- [x] `profile.service.test.ts`

## Key Implementation Details

### Prisma (Data Access)
- Uses Prisma 7 with `@prisma/adapter-pg`
- Client generated via `npx prisma generate`
- Migrations via `npx prisma migrate dev --name <name>`
- Database: PostgreSQL on localhost:5432

### GraphQL (Presentation)
- Uses `graphql-http` (NOT Apollo Server)
- Context contains `user` (from JWT cookie)
- `makeExecutableSchema` from `@graphql-tools/schema`
- TypeDefs combined in `src/index.ts`

### Socket.IO (Presentation)
- Initialized with `initializeSocket(httpServer)` in `src/index.ts`
- `userSocketMap: Map<string, Set<string>>` for multi-tab support
- `emitToUser(userId, event, payload)` sends to all user's sockets
- JWT auth via cookie or `socket.handshake.auth.token`
- Uses `httpServer.listen` (NOT `app.listen`)

### Notify Helper (Cross-Cutting)
- `createNotification({ recipientId, actorId, type, postId, commentId, followRequestId })`
- Skips if `recipientId === actorId` (no self-notifications)
- Skips duplicates for `LIKE` and `COMMENT_LIKE`
- Emits socket event `notification:new` with `unreadCount`
- Includes `actor` and `followRequest` (with requester/target)

### File Upload (Service Layer)
- Avatar: `uploads/`
- Post media: `uploads/posts/`
- Story media: `uploads/stories/`
- Uses `multer` with `randomUUID` for filenames
- Served statically via `express.static('/uploads', ...)`

### Private Profile (Data Access)
- `canViewPrivateProfile(viewerId, profileOwner)` in `checkProfileAccess.ts`
- Applied in: `getPost`, `getUserPosts`, `getFeed`, `getUserStories`

### Story Visibility (Data Access)
- `canViewStory(viewerId, story)` in `checkStoryAccess.ts`
- PUBLIC: everyone
- FOLLOWERS: only followers
- CLOSE_FRIENDS: only close friends

### Cron Job (Cross-Cutting)
- `startStoryCleanupJob()` in `src/index.ts`
- Runs immediately on startup
- Runs every hour via `cron.schedule('0 * * * *')`
- Deletes files + DB records for expired stories

### Auth (Cross-Cutting)
- JWT stored in HTTP-only cookie (`token`)
- `requireAuth(context, message)` throws if no user
- Password hashing: bcryptjs

## Environment Variables (.env)
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `PORT` — Server port (default 4000)

## Useful Commands

```bash
# Development
npm run dev

# Database
npx prisma studio
npx prisma generate
npx prisma migrate dev --name <name>

# Testing
npm test
npm test -- <path>

# Seeding
npx tsx src/seed.ts

Endpoints
GraphQL: http://localhost:4000/graphql

Playground: http://localhost:4000/playground

Uploads: http://localhost:4000/uploads/...

Future Features
□ Saved Posts
□ Direct Messages
□ Groups
Last Updated
2026-10-15 — Added notify tests (12 tests); notification.mutations tests (7 tests); notification.queries tests (8 tests); expanded follow.resolvers tests (16 tests)