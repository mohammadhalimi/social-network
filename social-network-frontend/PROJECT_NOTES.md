# Frontend Project Notes — Social Network

## Overview
Instagram-like social network frontend, built with **Next.js 16 (App Router)** using **Feature-Based Architecture**.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit + Apollo Client (Cache)
- **GraphQL:** @apollo/client 4
- **Real-time:** socket.io-client
- **UI Icons:** lucide-react
- **Animations:** framer-motion
- **Toast:** react-hot-toast
- **Date:** date-fns (with faIR locale)
- **Forms:** react-hook-form + zod
- **Testing:** Jest + React Testing Library

## Architecture: Feature-Based
src/app/
├── (routing pages)
│ ├── layout.tsx # Root layout (Providers + Header + PostModalRenderer)
│ ├── page.tsx # Home page
│ ├── profile/ # Own user profile
│ ├── user/[username]/ # Public user profile
│ ├── notifications/ # Notifications page
│ ├── auth/ # Login, Register, Reset Password
│ └── search/ # Search page
│
├── components/
│ ├── layout/ # Shared layout components
│ │ └── Header.tsx
│ ├── modals/ # Global modals
│ │ └── PostModalRenderer.tsx
│ ├── notification/ # Notification feature
│ │ ├── NotificationBadge.tsx
│ │ ├── NotificationBell.tsx
│ │ ├── NotificationDropdown.tsx
│ │ ├── NotificationItem.tsx
│ │ └── NotificationListener.tsx (optional)
│ ├── profile/ # Profile feature
│ │ ├── posts/ # Post-related components
│ │ │ ├── PostList.tsx
│ │ │ ├── PostItem/ # Sub-folder for PostItem
│ │ │ ├── PostActions.tsx
│ │ │ ├── CreatePost.tsx
│ │ │ ├── EditPostModal.tsx
│ │ │ ├── ViewPostModal/ # Sub-folder for ViewPostModal
│ │ │ ├── ConfirmModal.tsx
│ │ │ ├── blocks/ # Block components (for CreatePost)
│ │ │ └── tests/
│ │ ├── settings/ # Settings feature
│ │ │ ├── index.tsx
│ │ │ ├── ChangeTheme.tsx
│ │ │ └── PrivacyToggle.tsx
│ │ ├── Sidebar.tsx
│ │ ├── MobileMenu.tsx
│ │ ├── ProfileInfo.tsx
│ │ └── tests/
│ ├── story/ # Story feature
│ │ ├── CreateStoryModal/
│ │ ├── StoryViewerModal/
│ │ ├── CloseFriendsSelector/
│ │ ├── StoriesBar.tsx
│ │ └── tests/
│ ├── UserName/ # Public user profile feature
│ │ ├── CommentForm/
│ │ ├── FollowListModal/
│ │ ├── FollowButton.tsx
│ │ ├── ProfileHeader.tsx
│ │ ├── ProfileInfo.tsx
│ │ ├── ProfilePostCard.tsx
│ │ ├── ProfilePostsList.tsx
│ │ ├── UserProfileContent.tsx
│ │ ├── PrivateProfileMessage.tsx
│ │ └── tests/
│ ├── search/ # Search feature
│ └── auth/ # Auth feature
│
├── graphql/ # Apollo queries & mutations
│ ├── auth.queries.ts
│ ├── post.queries.ts
│ ├── profile.queries.ts
│ ├── story.queries.ts
│ ├── user.queries.ts
│ ├── notification.queries.ts
│ └── tests/
│
├── hooks/ # Custom hooks
│ └── useNotifications.ts
│
├── lib/ # Utilities
│ ├── apollo-client.ts
│ ├── formatDate.ts
│ ├── uploadStory.ts
│ ├── upload.ts
│ └── utils/avatar.ts
│
├── providers/ # React Contexts
│ ├── providers.tsx # Main Providers
│ └── SocketProvider.tsx
│
├── redux/ # Redux store & slices
│ ├── store.ts
│ ├── hooks.ts
│ └── features/
│ ├── authSlice.ts
│ ├── themeSlice.ts
│ ├── uiSlice.ts
│ └── tests/
│
└── search/ # (route)


### Feature-Based Rules

| Rule | Description |
| :--- | :--- |
| **Isolation** | Each feature lives in its own folder with all related files. |
| **Sub-components** | If a component exceeds 200 lines, split it into a sub-folder. |
| **Types** | Feature-specific types go in `types.ts` inside the feature folder. |
| **Tests** | All tests live in `__tests__/` next to the code. |
| **Shared utilities** | Go to `lib/` or `hooks/` (NOT inside features). |
| **GraphQL** | All queries/mutations in `graphql/*.ts` (centralized). |

### Component Folder Convention

If a component has multiple sub-components, create a folder:
ComponentName/
├── index.tsx # Main component
├── types.ts # Types (if any)
├── SubComponent1.tsx
├── SubComponent2.tsx
├── useCustomHook.ts # Feature-specific hook
└── tests/ # Tests


**Example (Story feature):**

story/
├── CreateStoryModal/
│ ├── index.tsx
│ ├── DurationSelector.tsx
│ ├── MediaPicker.tsx
│ ├── VisibilitySelector.tsx
│ ├── useCreateStory.ts
│ └── tests/useCreateStory.test.tsx
├── StoryViewerModal/
│ ├── index.tsx
│ ├── NavigationButtons.tsx
│ ├── ProgressBar.tsx
│ ├── StoryHeader.tsx
│ ├── StoryMedia.tsx
│ ├── ViewersButton.tsx
│ ├── ViewersModal.tsx
│ ├── useStoryViewer.ts
│ ├── types.ts
│ └── tests/useStoryViewer.test.tsx
└── CloseFriendsSelector/
├── index.tsx
├── FollowerListItem.tsx
├── useCloseFriendsSelection.ts
├── useFollowersPagination.ts
└── tests/


## Implemented Features

### Auth
- [x] Register, Login, Logout
- [x] Forgot Password, Reset Password
- [x] AuthChecker (redirects unauthenticated users)
- [x] ProtectedRoute

### Post
- [x] Create, Read, Update, Delete
- [x] PostList (Infinite Scroll)
- [x] PostItem (with preview)
- [x] PostActions (Like, Comment, Share)
- [x] ViewPostModal (global + in PostCard)
- [x] EditPostModal (with blocks)
- [x] PostModalRenderer (global with CommentForm)

### Comment
- [x] CommentForm (comment + reply)
- [x] CommentItem, CommentsList, ReplyItem
- [x] CommentLikeButton

### Follow
- [x] FollowButton (3 states: Follow, Following, Pending)
- [x] FollowListModal (FollowList, SearchInput, UserListItem)
- [x] Private Profile Message

### Story
- [x] CreateStoryModal (upload + duration/visibility)
- [x] StoriesBar (story rings)
- [x] StoryViewerModal (Slideshow + Progress + Navigation)
- [x] CloseFriendsSelector (Infinite Scroll)

### Notification
- [x] NotificationBell + Badge
- [x] NotificationDropdown (max 5 + "See all")
- [x] NotificationItem (LIKE, COMMENT, REPLY, COMMENT_LIKE, FOLLOW, FOLLOW_REQUEST)
- [x] Notifications page `/notifications` (Infinite Scroll)
- [x] useNotifications (Apollo Cache + Socket)

### Search
- [x] SearchBar
- [x] SearchResults (Infinite Scroll)
- [x] SearchResultItem

### UI
- [x] Shared Header
- [x] Mobile Menu (only on /profile)
- [x] Sidebar
- [x] Theme (Dark/Light)
- [x] ImagePreviewModal
- [x] ConfirmModal

## Tests Written

### Helpers
- [x] `formatPost.test.ts`
- [x] `mapUser.test.ts`

### Hooks
- [x] `useStoryViewer.test.tsx`
- [x] `useFollowersPagination.test.tsx`
- [x] `useCloseFriendsSelection.test.tsx`
- [x] `useCreateStory.test.tsx`

### Components
- [x] `CommentItem.test.tsx`
- [x] `CommentLikeButton.test.tsx`
- [x] `PostItem.test.tsx`
- [x] `PostList.test.tsx`
- [x] `PostActions.test.tsx`
- [x] `ProfilePage.test.tsx`
- [x] `ProfileInfo.test.tsx`
- [x] `ConfirmModal.test.tsx`
- [x] `ProfilePostCard.test.tsx`
- [x] `CommentForm.test.tsx`
- [x] `CreatePost.test.tsx`
- [x] `EditPostModal.test.tsx`
- [x] `LoginPage.test.tsx`
- [x] `RegisterPage.test.tsx`
- [x] `ForgotPasswordPage.test.tsx`
- [x] `ResetPasswordPage.test.tsx`
- [x] `Settings.test.tsx`
- [x] `MobileMenu.test.tsx` (14 tests, 100% coverage)
- [x] `Header.test.tsx` (15 tests, 100% coverage)
- [x] `NotificationBell.test.tsx`
- [x] `NotificationDropdown.test.tsx`
- [x] `NotificationItem` tests:
  - `useNotificationItem.test.tsx` (19 tests, 100% coverage)
  - `index.test.tsx` (15 tests)

### GraphQL
- [x] `post.queries.test.ts`
- [x] `story.queries.test.ts`
- [x] `user.queries.test.ts`
- [x] `auth.queries.test.ts`
- [x] `profile.queries.test.ts`

### Redux
- [x] `authSlice.test.ts`
- [x] `themeSlice.test.ts`

### Providers
- [x] `SocketProvider.test.tsx` (9 tests) — socket creation, events, cleanup, URL prop

## Coding Rules

### General
1. **Use TypeScript strictly** — no `any` unless absolutely necessary.
2. **All UI text in Persian (fa)**.
3. **RTL layout** — `dir="rtl"` on root.
4. **Component size limit**: 200 lines max.
5. **Follow existing patterns** (e.g., `errorPolicy: 'all'`).
6. **Every new hook/component** must have a test.

### Components
- Split large components into smaller ones (in a folder).
- Keep components pure when possible.
- Use composition over inheritance.
- Export from `index.tsx` (default export for main component).

### State Management
- **Apollo Cache** for server data.
- **Redux Toolkit** for UI state (`uiSlice`) and auth (`authSlice`).
- **useState** for local state.

### GraphQL
- Use `errorPolicy: 'all'` in `useMutation`.
- Handle loading and error states.
- Update Apollo Cache via `cache.modify`, `writeQuery`, or `refetchQueries`.
- Use `TypedDocumentNode` for all queries/mutations.

### Styling
- Tailwind CSS 4 only.
- Use design tokens (`primary`, `secondary`, `card`, `border`, etc.).
- No inline styles.

### Testing
- Use Jest + React Testing Library.
- Mock Apollo, Socket, Redux as needed.
- Test files: `*.test.tsx` or `*.test.ts`.
- Run: `npm test -- <path>`
- Coverage: `npm test -- --coverage`

## Key Implementation Details

### Logout
- `useLogout` hook: Apollo `LOGOUT` mutation + Redux `logout()` + redirect.
- Backend clears `HTTP-only` cookie via `res.clearCookie`.
- No `document.cookie` or `localStorage` needed.

### Notification
- `NotificationBell`: button with `aria-label="اعلان‌ها"` and `aria-expanded`.
- `NotificationBadge`: shows `unreadCount`.
- `NotificationDropdown`: rendered only when `isOpen`, receives `notifications`, `unreadCount`, `loading`, `onClose`.
- Outside click detection via `mousedown` on `document`, cleanup on unmount.
- `useNotifications` hook: Apollo Cache + Socket (`notification:new`).

### Socket
- `SocketProvider` with `credentials: 'include'`.
- `useSocket` hook returns `{ socket, isConnected }`.
- URL from `url` prop > `NEXT_PUBLIC_API_URL` > `http://localhost:4000`.
- `SOCKET_URL` read inside `useEffect` (not module-level) for testability.
- Events: `connect`, `disconnect`, `connect_error`.
- Cleanup: `socket.disconnect()` on unmount.
- Event `notification:new` for new notifications.
- `console.log` only in development (`NODE_ENV === 'development'`).

### Apollo Client
- `credentials: 'include'` to send cookies.
- `fetchPolicy: 'network-only'` in `apollo-client.ts`.
- `errorPolicy: 'all'` in `useMutation`.
- Uses `cache.modify` and `writeQuery` for cache updates.

### Redux
- `uiSlice` for UI State (`isMobileMenuOpen`, `postModalId`).
- `window.store` in Development for debugging.
- `useAppDispatch`, `useAppSelector` hooks.

### Socket
- `SocketProvider` with `credentials: 'include'`.
- `useSocket` hook.
- Event `notification:new` for new notifications.

### RTL
- `dir="rtl"` in `layout.tsx`.
- Careful Tailwind classes in RTL.

### Date
- `formatPersianDate` in `lib/formatDate.ts`.
- Uses `date-fns` with `faIR` locale.

## Environment Variables (.env.local)
- `NEXT_PUBLIC_API_URL` — Backend URL (default: http://localhost:4000)
  - Used by Apollo Client AND SocketProvider.

## Useful Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Testing
npm test             # Run all tests
npm test -- <path>   # Run specific test file
npm test -- --coverage  # Run with coverage

# Build
npm run build        # Production build
npm start            # Start production server

Endpoints
Frontend: http://localhost:3000

Backend GraphQL: http://localhost:4000/graphql

Backend Playground: http://localhost:4000/playground

Current Focus
Writing tests for existing features.

Refactoring large components into smaller ones.

Improving readability and scalability.

Future Features
□ Saved Posts
□ Direct Messages
□ Groups
Last Updated
2026-10-24 — Added `ProfilePage` integration tests (13 tests, 91.93% coverage):
  - Render: Sidebar, ProfileContent, MobileMenu.
  - Tab change via Sidebar & MobileMenu (with Redux close dispatch).
  - Story modal: open via Sidebar/MobileMenu, close, success toast.
  - MobileMenu isOpen from Redux.
  - handleLogout: calls mutation, dispatches, redirects; error handling.
  - Added `useLogout` hook (100% coverage).