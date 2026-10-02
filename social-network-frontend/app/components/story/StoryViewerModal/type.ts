// components/story/StoryViewerModal/types.ts

export interface StoryViewerUser {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
}

export interface StoryViewerEntry {
    user: StoryViewerUser;
    viewedAt: string;
}