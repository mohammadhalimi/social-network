'use client';

import { useQuery } from '@apollo/client/react';
import {
    useState,
    useRef,
    useCallback,
    useEffect
} from 'react';
import {
    GET_USER_STORIES,
    Story
} from '@/app/graphql/story.queries';

const LONG_PRESS_DURATION = 400;

interface UseProfileHeaderProps {
    userId: string;
    canViewContent: boolean;
    avatarUrl: string | null;
}

export const useProfileHeader = ({ userId, canViewContent, avatarUrl }: UseProfileHeaderProps) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [isLongPressing, setIsLongPressing] = useState(false);

    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);

    const { data, refetch } = useQuery(GET_USER_STORIES, {
        variables: { userId },
        fetchPolicy: 'cache-and-network',
        skip: !canViewContent,
    });

    const stories: Story[] = data?.getUserStories || [];
    const hasStories = canViewContent && stories.length > 0;
    const hasUnviewedStory = stories.some(s => !s.isViewedByMe);
    const initialIndex = hasUnviewedStory ? stories.findIndex(s => !s.isViewedByMe) : 0;

    const handlePressStart = useCallback(() => {   // ✅ بدون آرگومان
        if (!avatarUrl) return;                     // ✅ از avatarUrl خودِ hook استفاده کن
        isLongPressRef.current = false;

        pressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setIsLongPressing(true);
        }, LONG_PRESS_DURATION);
    }, [avatarUrl]);

    const handlePressEnd = useCallback(() => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }

        if (isLongPressRef.current) {
            setIsLongPressing(false);
        } else if (hasStories) {
            setViewerOpen(true);
        }
    }, [hasStories]);

    const handlePressCancel = useCallback(() => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        setIsLongPressing(false);
    }, []);

    // ✅ cleanup
    useEffect(() => {
        return () => {
            if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
        };
    }, []);

    return {
        viewerOpen,
        isLongPressing,
        stories,
        hasStories,
        hasUnviewedStory,
        initialIndex,
        refetch,
        handlePressStart,
        handlePressEnd,
        handlePressCancel,
        closeViewer: () => setViewerOpen(false),
    };
};