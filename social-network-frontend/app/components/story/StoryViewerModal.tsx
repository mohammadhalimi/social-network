// components/story/StoryViewerModal/index.tsx
'use client';

import { useState } from 'react';
import { Story } from '@/app/graphql/story.queries';
import { useStoryViewer } from './StoryViewerModal/useStoryViewer';
import { ProgressBar } from './StoryViewerModal/ProgressBar';
import { StoryHeader } from './StoryViewerModal/StoryHeader';
import { StoryMedia } from './StoryViewerModal/StoryMedia';
import { NavigationButtons } from './StoryViewerModal/NavigationButtons';
import { ViewersButton } from './StoryViewerModal/ViewersButton';
import { ViewersModal } from './StoryViewerModal/ViewersModal';

interface StoryViewerModalProps {
    stories: Story[];
    initialIndex?: number;
    isOwner: boolean;
    isOpen: boolean;
    onClose: () => void;
    onStoryViewed?: (storyId: string) => void;
}

export const StoryViewerModal = ({
    stories,
    initialIndex = 0,
    isOwner,
    isOpen,
    onClose,
    onStoryViewed,
}: StoryViewerModalProps) => {
    const [showViewers, setShowViewers] = useState(false);

    const { currentIndex, currentStory, isVideo, progress, videoRef, goToNext, goToPrev, setIsPaused } =
        useStoryViewer({ stories, initialIndex, isOwner, isOpen, onClose, onStoryViewed });

    if (!isOpen || !currentStory) return null;

    return (
        <div
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="relative w-full max-w-md h-[90vh] flex flex-col">
                <ProgressBar total={stories.length} currentIndex={currentIndex} progress={progress} />

                <StoryHeader
                    user={currentStory.user}
                    createdAt={currentStory.createdAt}
                    onClose={onClose}
                />

                <StoryMedia
                    mediaUrl={currentStory.mediaUrl}
                    isVideo={isVideo}
                    videoRef={videoRef}
                />

                <NavigationButtons
                    canGoPrev={currentIndex > 0}
                    onPrev={goToPrev}
                    onNext={goToNext}
                />

                {isOwner && (
                    <ViewersButton
                        viewsCount={currentStory.viewsCount}
                        onClick={() => setShowViewers(true)}
                    />
                )}
            </div>

            {showViewers && isOwner && (
                <ViewersModal
                    viewers={currentStory.viewers}
                    onClose={() => setShowViewers(false)}
                />
            )}
        </div>
    );
};