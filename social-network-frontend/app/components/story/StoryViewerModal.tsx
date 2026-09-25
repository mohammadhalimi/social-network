// components/story/StoryViewerModal.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { VIEW_STORY, Story } from '@/app/graphql/story.queries';

interface StoryViewerModalProps {
    stories: Story[];
    initialIndex?: number;
    isOwner: boolean;
    isOpen: boolean;
    onClose: () => void;
    onStoryViewed?: (storyId: string) => void;
}

const IMAGE_DURATION = 5000; // ۵ ثانیه برای عکس

export const StoryViewerModal = ({
    stories,
    initialIndex = 0,
    isOwner,
    isOpen,
    onClose,
    onStoryViewed,
}: StoryViewerModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
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
                .catch(() => {});
        }
    }, [currentIndex, isOpen, currentStory, isOwner, viewStory, onStoryViewed]);

    // ✅ رفتن به استوری بعدی
    const goToNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    // ✅ رفتن به استوری قبلی
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

        // ✅ برای ویدیو، نوار پیشرفت بر اساس مدت ویدیو
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
            // ✅ برای عکس، ۵ ثانیه ثابت
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
                {/* ✅ نوار پیشرفت */}
                <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                    {stories.map((_, idx) => (
                        <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width:
                                        idx < currentIndex ? '100%' :
                                        idx === currentIndex ? `${progress}%` :
                                        '0%',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ✅ هدر */}
                <div className="absolute top-8 left-4 right-4 z-20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-2 border-white/50">
                        {currentStory.user?.avatar ? (
                            <Image
                                src={currentStory.user.avatar}
                                alt={currentStory.user.fullName}
                                className="w-full h-full object-cover"
                                width={40}
                                height={40}
                                unoptimized
                            />
                        ) : (
                            <span className="text-white font-bold">
                                {currentStory.user?.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                            {currentStory.user?.fullName}
                        </p>
                        <p className="text-white/60 text-xs">
                            {new Date(currentStory.createdAt).toLocaleTimeString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ✅ مدیا */}
                <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden rounded-xl mt-16">
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            autoPlay
                            playsInline
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <Image
                            src={currentStory.mediaUrl}
                            alt="استوری"
                            className="max-w-full max-h-full object-contain"
                            width={800}
                            height={1200}
                            unoptimized
                        />
                    )}
                </div>

                {/* ✅ ناوبری کناره‌ها */}
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    disabled={currentIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 transition-colors z-20"
                >
                    <ChevronLeft size={32} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors z-20"
                >
                    <ChevronRight size={32} />
                </button>

                {/* ✅ دکمه نمایش بازدیدکنندگان (فقط برای صاحب استوری) */}
                {isOwner && (
                    <button
                        onClick={() => setShowViewers(true)}
                        className="absolute bottom-6 left-4 right-4 z-20 flex items-center justify-center gap-2 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/20 transition-colors"
                    >
                        <Eye size={18} />
                        {currentStory.viewsCount} بازدید
                    </button>
                )}
            </div>

            {/* ✅ مودال بازدیدکنندگان */}
            {showViewers && isOwner && (
                <ViewersModal
                    viewers={currentStory.viewers}
                    onClose={() => setShowViewers(false)}
                />
            )}
        </div>
    );
};

// ✅ مودال بازدیدکنندگان
const ViewersModal = ({ viewers, onClose }: { viewers: any[]; onClose: () => void }) => (
    <div
        className="fixed inset-0 bg-black/80 z-[110] flex items-end justify-center"
        onClick={onClose}
    >
        <div
            className="bg-card rounded-t-3xl w-full max-w-md max-h-[60vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                    بازدیدکنندگان ({viewers.length})
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-border rounded-lg">
                    <X size={20} />
                </button>
            </div>
            {viewers.length === 0 ? (
                <p className="text-center text-secondary py-4">هنوز کسی این استوری را ندیده</p>
            ) : (
                <div className="space-y-3">
                    {viewers.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                                {v.user.avatar ? (
                                    <Image
                                        src={v.user.avatar}
                                        alt={v.user.fullName}
                                        className="w-full h-full object-cover"
                                        width={40}
                                        height={40}
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-white font-bold">
                                        {v.user.fullName?.[0] || '👤'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">{v.user.fullName}</p>
                                <p className="text-xs text-secondary">@{v.user.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);