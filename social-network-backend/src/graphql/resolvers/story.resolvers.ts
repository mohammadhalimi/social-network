// src/graphql/resolvers/story.resolvers.ts
import { storyQueries } from './story/story.queries';
import { storyMutations } from './story/story.mutations';

export const storyResolvers = {
    Query: {
        ...storyQueries,
    },
    Mutation: {
        ...storyMutations,
    },
};