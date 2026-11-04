// src/graphql/resolvers/post/saved-post.resolvers.ts
import { formatPost } from '../helpers/formatPost';
import { requireAuth } from '../try-catch/requireAuth';
import { SavedPostService } from '../../../modules/posts/saved-post.service';

const savedPostService = new SavedPostService();

export const savedPostResolvers = {
    Query: {
        getSavedPosts: async (_: any, { limit = 20, offset = 0 }: any, context: any) => {
            const userId = requireAuth(context);
            const result = await savedPostService.getSavedPosts(userId, limit, offset);
            
            return {
                ...result,
                posts: result.posts.map(post => formatPost(post, userId)),
            };
        },
    },
    Mutation: {
        toggleSavePost: async (_: any, { postId }: { postId: string }, context: any) => {
            const userId = requireAuth(context);
            return await savedPostService.toggleSavePost(userId, postId);
        },
    },
};