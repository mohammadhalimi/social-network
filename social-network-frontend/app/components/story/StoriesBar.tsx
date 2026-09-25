// components/story/StoriesBar.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { GET_USER_STORIES, Story } from '@/app/graphql/story.queries';
import { StoryViewerModal } from './StoryViewerModal';

interface StoriesBarProps {
    userId: string;
    isOwner: boolean;
    currentUserAvatar?: string | null;
    onCreateStory?: () => void;
}

export const StoriesBar = ({
    userId,
    isOwner,
    currentUserAvatar,
    onCreateStory,
}: StoriesBarProps) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    const { data, loading, refetch } = useQuery(GET_USER_STORIES, {
        variables: { userId },
        fetchPolicy: 'cache-and-network',
    });

    const stories: Story[] = data?.getUserStories || [];

    // ✅ اضافه کنید

    const handleStoryClick = (index: number) => {
        setInitialIndex(index);
        setViewerOpen(true);
    };

    const handleStoryViewed = () => {
        refetch();
    };

    return (
        <>
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 overflow-x-auto">
                <div className="flex gap-4">
                    {/* ✅ دکمه افزودن استوری (فقط برای صاحب پروفایل) */}
                    {isOwner && (
                        <button
                            onClick={onCreateStory}
                            className="flex flex-col items-center gap-2 flex-shrink-0 group"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors">
                                    {currentUserAvatar ? (
                                        <Image
                                            src={currentUserAvatar}
                                            alt="استوری من"
                                            className="w-full h-full object-cover opacity-70"
                                            width={64}
                                            height={64}
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-white font-bold">👤</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center border-2 border-card">
                                    <Plus size={14} />
                                </div>
                            </div>
                            <span className="text-xs text-secondary truncate max-w-[70px]">
                                استوری من
                            </span>
                        </button>
                    )}

                    {/* ✅ استوری‌های خود کاربر (اگر وجود دارند) */}
                    {stories.map((story, idx) => (
                        <button
                            key={story.id}
                            onClick={() => handleStoryClick(idx)}
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                        >
                            <div
                                className={`
                                    w-16 h-16 rounded-full p-0.5
                                    ${!story.isViewedByMe
                                        ? 'bg-gradient-to-tr from-primary to-purple-500'
                                        : 'bg-border'
                                    }
                                `}
                            >
                                <div className="w-full h-full rounded-full bg-card p-0.5">
                                    <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                                        <span className="text-white font-bold text-xs">
                                            {new Date(story.createdAt).toLocaleTimeString('fa-IR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-secondary truncate max-w-[70px]">
                                {new Date(story.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                        </button>
                    ))}

                    {/* ✅ اگر استوری وجود ندارد و کاربر صاحب پروفایل نیست */}
                    {!loading && stories.length === 0 && !isOwner && (
                        <p className="text-sm text-secondary self-center px-4">
                            هنوز استوری‌ای منتشر نشده است
                        </p>
                    )}
                </div>
            </div>

            {/* ✅ مودال نمایش استوری */}
            {viewerOpen && stories.length > 0 && (
                <StoryViewerModal
                    stories={stories}
                    initialIndex={initialIndex}
                    isOwner={isOwner}
                    isOpen={true}
                    onClose={() => setViewerOpen(false)}
                    onStoryViewed={handleStoryViewed}
                />
            )}
        </>
    );
};