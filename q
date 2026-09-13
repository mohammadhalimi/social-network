[33mcommit 338c6bf88261cd2cdd6add484e4e0c53020d925d[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m)[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Sep 13 23:16:15 2026 +0330

    feat(comments): add nested replies with redesigned UI; fix date serialization
    
    - fix Invalid Date on newly created comments/replies (Prisma Date not serialized to ISO)
    
    - add reply-to-comment support with dedicated form and thread UI
    
    - add FollowListModal and ImagePreviewModal components
    
    - update related GraphQL queries/schema for replies support

[33mcommit 0f4b52b0cf6e2705865a2e4b2f61a39fb71b2071[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 10 00:25:06 2026 +0330

    fix(comments): prevent unhandled promise rejection on GraphQL errors

[33mcommit b4dbf6a542f49b9b558a488191667b0b1067fff3[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 10 00:03:14 2026 +0330

    fix(post): add errorPolicy and handle mutation errors in PostActions

[33mcommit 167a0e95b38c98b4a13acca37cafe63cfd07889e[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Wed Sep 9 23:48:59 2026 +0330

    fix(follow): add errorPolicy and handle mutation errors in FollowButton

[33mcommit 28cc6a2fe1d43d271ba4056916757af454ad2cdc[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 8 23:25:29 2026 +0330

    add test for follow.resolver.ts

[33mcommit e98d26740996918517fca3553cef514a46b6caaf[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 8 23:10:47 2026 +0330

    update profile.resolvers.tests.ts

[33mcommit b30faa0cf3b8c07932f3679a1f03df01db284000[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 8 23:07:20 2026 +0330

    test(auth): update register/login test expectations for new User fields
    
    mapUser now always returns followersCount, followingCount, and isFollowing (defaulting to 0/false when no follow info is passed), so the expected user object in these tests needed to include them

[33mcommit f4641a0746a4d73733bba5fe415f4c23cf96d7bb[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 8 22:53:27 2026 +0330

    test(queries): update userQueries tests for search prioritization and follow logic

[33mcommit 3379872e0c4161fa2201a161f77a340bc3a77dae[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 8 22:37:10 2026 +0330

    update mapuser.test.ts for following and follower

[33mcommit 39a0da7a633b921729ebec4872e764d30a16f9d7[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Sep 7 00:37:41 2026 +0330

    fix(follow): sync GET_USER_BY_USERNAME query with backend schema
    
    query was missing followersCount, followingCount, and isFollowing fields, causing follow state to reset after page refresh even though the User type now supports them

[33mcommit 3807926a2ec720e54c9358ff3fbd080e8f983e44[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Sep 7 00:07:07 2026 +0330

    feat(profile): add follow button and user's posts to profile page
    
    adds FollowButton, ProfilePostCard, ProfilePostsList, and FOLLOW_USER/UNFOLLOW_USER mutations; profile page now shows followers/following counts and the user's posts with like/comment support

[33mcommit 2366bec8c419f8f226d7af80aca07ed988e88291[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Sep 6 23:44:59 2026 +0330

    feat(follow): add follow/unfollow functionality
    
    - add Follow model to Prisma schema with self-relation on User (followers/following)
    
    - extend User GraphQL type with followersCount, followingCount, isFollowing fields
    
    - add followUser/unfollowUser mutations with FollowResponse type
    
    - update mapUser helper to accept optional follow info
    
    - update getUserByUsername to return follow stats and isFollowing status relative to current user
    
    - fix searchUsers map callback passing array index as mapUser's second argument

[33mcommit b8eaee7e3b67ffc66e621d13fc224e1eb42ea1f7[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Sep 6 23:10:05 2026 +0330

    fix(search): improve RTL UX by moving search icon to left and replacing it with clear button on input

[33mcommit 5bd9f0668da9c52793b54789dfd736e3ad809243[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Sep 6 23:02:52 2026 +0330

    fix(search): rank prefix matches above substring matches in searchUsers

[33mcommit 60b0fa2e423d59d88ce3c4197d439fa7454f6a87[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 21:32:18 2026 +0330

    update video block for size of video

[33mcommit 012b302227230cf315af6dd021dae5c31f0d53fd[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 21:18:22 2026 +0330

    add test for useEditPostBlocks.test.ts

[33mcommit 90ccbeae980fb640131a81791b288078dcbc7361[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 20:49:48 2026 +0330

    update post.queries.test.ts for GET_POST_COMMENTS

[33mcommit 8e8998318f2cb4b3e9a5d8d91c815d597177a7c6[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 20:43:41 2026 +0330

    add test for PostList.tsx

[33mcommit 73dde0e9f6af229c777476519c598fd5791317e4[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 20:27:52 2026 +0330

    add test for ConfirmModal.tsx

[33mcommit e8dd41aaadd0c8a9983fe05ece391eec227559ab[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 19:38:11 2026 +0330

    add test for PostItem.tsx

[33mcommit 289936bde9268fe1cdb41462a9e292035622b4f7[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 19:12:15 2026 +0330

    add test for EditPostModal.tsx

[33mcommit 9c232878325b3cc77d3e2c7e8f954ebcffabf93f[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 18:37:31 2026 +0330

    refactor(posts): modularize EditPostModal and fix RemoveBlockButton positioning

[33mcommit 9669220ef61b7c1534b8209661da1c38f1d8f22e[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Thu Sep 3 01:52:28 2026 +0330

    fix-posts-resolve-duplicate-keys-invalid-dates-and-improve-post-ui
    
    - fix duplicate React keys in PostList by preventing allPosts reset on fetchMore and adding id-based dedupe
    - fix preview image not showing when it was not the first content block - early break bug in PostItem
    - fix Invalid Date by serializing createdAt and updatedAt to ISO strings in formatPost helper - Prisma Date object serialization issue
    - extract shared formatPersianDate utility to avoid date-formatting duplication across components
    - add autoplaying muted video preview in PostItem prioritizing image over video when both exist
    - add ConfirmModal component and wire it into post deletion flow
    - fix posts not actually being deleted from the database - handleDelete was only updating local state now calls deletePost mutation
    - add likes-comments count display and lazy-loaded comment list via useLazyQuery in PostItem
    - fix video sizing in ViewPostModal constrain height preserve aspect ratio center with black background

[33mcommit ce0cb1bea21e07c5bed412c4af24beac62e2484b[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 1 21:01:59 2026 +0330

    update post.queries.ts and post.test.ts for delete and update

[33mcommit 05e462fb3630a456dcc89b694845435f33366101[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Sep 1 20:44:46 2026 +0330

    add tests for post.queries.ts and user.queries.ts

[33mcommit 7b9f5936843a1df7c3667ca88c53bc2c833cc226[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Aug 30 23:25:48 2026 +0330

    test(posts): add unit tests for blocks, CreatePost* components and upload utility

[33mcommit 4c94c44fe102ef7a1083629e7635418a9397e2a4[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Aug 30 22:32:03 2026 +0330

    refactor ProtectedRoute.tsx for High readability

[33mcommit 94d1b75540e47683efb848c307f9528ded9ca0c9[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Aug 30 00:07:11 2026 +0330

    refactor: colocate test files with modules for better organization

[33mcommit 9e992310cdf395c33b1ace7261c4627162591fd6[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:52:52 2026 +0330

    test(post-resolvers): add unit tests for post mutations, likes, and comments

[33mcommit 32ed14e19ecbf43baeb0a1a23141813664c76b97[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:42:47 2026 +0330

    refactor(resolvers): reorganize post and user resolvers into domain folders

[33mcommit c4ba8c26b683b59ce779c7114ef63a0f9e9a10bb[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:23:50 2026 +0330

    test(helpers): add unit tests for mapUser, formatPost, and response helpers

[33mcommit 792e96d00bea783f05996ecb23e79e8374c5b9e9[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:16:44 2026 +0330

    fix(auth): validate userId existence in requireAuth

[33mcommit 84d4a183b22f8ac94c8a6c2e3ea35ea8b0eb322a[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:15:09 2026 +0330

    add test for try-catch

[33mcommit 77dad0811b66b361149c365a12d63e8fbb92af9e[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sat Aug 29 22:10:04 2026 +0330

    add test for upload.route.ts

[33mcommit 7a6e5ee0d11e7dd2732e87ad9148839965450285[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 18:41:45 2026 +0330

    add test for post-media.service.test.ts

[33mcommit 3f0a5d6b3add8c066d0df146fe9c332dcd36e68c[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 18:19:30 2026 +0330

    refactor: move upload route test to routes/__tests__ directory

[33mcommit b6b6ceef6e1ea8531a0dfb36c17cbf0fdad0bbae[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 18:08:41 2026 +0330

    fix: remove duplicate toast notifications on upload error

[33mcommit e6c71a567ed6b0362fc74e3d732628f231d4c73b[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 17:48:00 2026 +0330

    fix: improve upload error handling with proper status codes and logging

[33mcommit 3630fa6e1b52eb0be88ce307eb50b85457fef75d[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 17:35:37 2026 +0330

    feat: reset create post form on cancel instead of back navigation

[33mcommit 30d26f2cce0ba27a4fcbf2de18cc14881d3791f6[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 17:23:15 2026 +0330

    add notif by toast for createPost

[33mcommit 6aadb2724770f0a39ab7764c9304f4d10b99f52b[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Fri Aug 28 00:41:54 2026 +0330

    feat: add block-based post creation with media upload
    
    ✨ New Features:
    - Block-based editor with Header, Text, Image, Video blocks
    - Upload images and videos up to 50MB for posts
    - User-friendly error messages for file validation
    
    🔧 Technical Changes:
    - Backend: New post-media service with multer config
    - Frontend: Refactored CreatePost into smaller components
    - Added type guards for ContentBlock type safety
    
    📁 Structure:
    - /uploads/posts for post media storage
    - Component-based architecture with block components
    - Clean separation of concerns

[33mcommit d4dce6a03fdf702a6da3957eca0fec4e0eaf7f3d[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 25 22:04:47 2026 +0330

    implement post, comment, and like system

[33mcommit f76fefdd4502063c50373f00e5e19de53c86f5f9[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 25 21:32:37 2026 +0330

    add Post, Comment, Like models with relationships

[33mcommit b3bca30318c6133b00901b2e1fcac9f391aff0f0[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 25 00:17:36 2026 +0330

    add tests for searchBar and searchResult

[33mcommit 00f56a5d55cb30b87e9a2b8c40f594b94aa9d9d4[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 24 23:44:15 2026 +0330

    add users fake in seed.ts

[33mcommit 7b7678ba892281b6f1367430fc6310f95c2635cc[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 24 23:14:28 2026 +0330

    refactor(search): split SearchBar into smaller reusable components

[33mcommit c96df1ad56e98f204faaacc9e46371ea2a135ba2[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 24 00:23:03 2026 +0330

    update test user.queries.ts for searchUser and getUserByUsername

[33mcommit ebf031c10be230b2e9306715ebb7538692d38db9[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 24 00:06:07 2026 +0330

    (backend): add searchUsers and getUserByUsername queries

[33mcommit e36a07e8fff069f93e3321933e31c82621595dfb[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Aug 23 23:25:38 2026 +0330

    Organizing imports in test files

[33mcommit f7e2c88df4059f3a7921dfe20a908f6f644a7ad9[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Sun Aug 23 23:09:11 2026 +0330

    fix(profile): validate username correctly instead of silently blocking Persian input and swallowing error messages

[33mcommit ec0142728f6f60507a12e545edaa96c79c4d28b6[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 23:54:00 2026 +0330

    update auth.queries.test.ts for
    > REQUEST_PASSWORD_RESET,
    > RESET_PASSWORD,
    > VALIDATE_RESET_TOKEN

[33mcommit 5eb2fce2bdf9d6ba82dea59f6f471a60730d72db[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 23:44:52 2026 +0330

    create resuable FormInput component and update test for LoginPage ResetPassword ForgotPassword

[33mcommit 5d8aacc7395b4bbba63f29ab880546f1d711a938[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 22:31:15 2026 +0330

    update loginpage.test.tsx for AuthGuard

[33mcommit 94768612f9a5bae3422bbc453371d3d486ed6367[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 22:20:25 2026 +0330

    add tests for auth guards

[33mcommit 65875191c0b19e90ad6aa0b464bbf229b242d4da[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 22:13:58 2026 +0330

    add authguard for login page

[33mcommit 09bd3d8152fcf6cbf68e57683e927e9b877c32bd[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 01:05:25 2026 +0330

    add unit tests for reset-password

[33mcommit feb6716bdd981889f232b0a57a7e9bfcc59eacc6[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Tue Aug 18 00:48:43 2026 +0330

    add unit tests for forgot-password

[33mcommit 5ba448a1b4ad5c7d2486a75c0084077c31e5815e[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 17 23:37:05 2026 +0330

    test(auth): add unit tests for requestPasswordReset and resetPassword resolvers

[33mcommit 444841a2a8553ae75e225f83218ee3b96a9dbdae[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 17 01:59:50 2026 +0330

    feat(auth): implement password reset functionality
    
    - Add resetToken and resetTokenExpiresAt fields to User model
    - Add requestPasswordReset and resetPassword methods to AuthService
    - Implement email sending with nodemailer for reset links
    - Add requestPasswordReset and resetPassword mutations to GraphQL
    - Add validateResetToken query for token verification
    - Configure SMTP settings for email delivery
    - Add ForgotPassword and ResetPassword pages in frontend
    - Add common SuccessMessage component for consistent UI
    - Add password validation with zod for reset form

[33mcommit 478ccc22be632696bb6481c05656ddf83c0c8025[m
Author: unknown <mohammadhalimi.2001@gmail.com>
Date:   Mon Aug 17 00:07:08 2026 +0330

    feat(auth): implement password reset functionality
    
    - Add resetToken and resetTokenExpiresAt fields to User model
    - Add requestPasswordReset and resetPassword methods to AuthService
    - Implement email sending with nodemailer for reset links
    - Add requestPasswordReset and resetPassword mutations to GraphQL
    - Add validateResetToken query for token verification
    - Configure SMTP settings for email delivery
    - Add helpers for consistent responses and error handling (mapUser, response)
    - Refactor resolvers to use withTryCatch for better error handling
