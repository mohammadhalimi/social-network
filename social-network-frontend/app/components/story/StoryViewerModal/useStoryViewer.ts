// components/story/StoryViewerModal/useStoryViewer.ts
'use client';


import { useMutation } from '@apollo/client/react';
import { VIEW_STORY, Story } from '@/app/graphql/story.queries';
import {
    useState,
    useEffect,
    useRef,
    useCallback
} from 'react';

const IMAGE_DURATION = 5000; // ۵ ثانیه برای عکس

interface UseStoryViewerParams {
    stories: Story[];
    initialIndex: number;
    isOwner: boolean;
    isOpen: boolean;
    onClose: () => void;
    onStoryViewed?: (storyId: string) => void;
}

export const useStoryViewer = ({
    stories,
    initialIndex,
    isOwner,
    isOpen,
    onClose,
    onStoryViewed,
}: UseStoryViewerParams) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [viewStory] = useMutation(VIEW_STORY, { errorPolicy: 'all' });

    const currentStory = stories[currentIndex];
    const isVideo = currentStory?.mediaType === 'video';

    // ✅ ثبت بازدید (فقط برای صاحب استوری ثبت نمی‌شود)
    useEffect(() => {
        if (!isOpen || !currentStory || isOwner) return;
        if (!currentStory.isViewedByMe) {
            viewStory({ variables: { storyId: currentStory.id } })
                .then(() => onStoryViewed?.(currentStory.id))
                .catch(() => { });
        }
    }, [currentIndex, isOpen, currentStory, isOwner, viewStory, onStoryViewed]);

    const goToNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    // ✅ ریست شدن progress هنگام تغییر استوری
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);

    // ✅ مدیریت نوار پیشرفت
    useEffect(() => {
        if (!isOpen || isPaused || !currentStory) return;

        if (isVideo) {
            const video = videoRef.current;
            if (!video) return;

            const handleTimeUpdate = () => {
                if (video.duration) {
                    setProgress((video.currentTime / video.duration) * 100);
                }
            };
            const handleEnded = () => goToNext();

            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('ended', handleEnded);
            };
        } else {
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
                setProgress(newProgress);
                if (newProgress >= 100) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    goToNext();
                }
            }, 50);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [currentIndex, isOpen, isPaused, isVideo, currentStory, goToNext]);

    // ✅ بستن با Esc و ناوبری با کلیدهای جهت‌دار
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose, goToNext, goToPrev]);

    return {
        currentIndex,
        currentStory,
        isVideo,
        progress,
        videoRef,
        goToNext,
        goToPrev,
        setIsPaused,
    };
};