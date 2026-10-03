// src/graphql/resolvers/notification.resolvers.ts
import { notificationQueries } from './notification/notification.queries';
import { notificationMutations } from './notification/notification.mutations';

export const notificationResolvers = {
    Query: { ...notificationQueries },
    Mutation: { ...notificationMutations },
};