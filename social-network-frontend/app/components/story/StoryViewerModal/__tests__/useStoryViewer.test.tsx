// components/story/StoryViewerModal/__tests__/useStoryViewer.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useStoryViewer } from '../useStoryViewer';

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

const mockedUseMutation = useMutation as unknown as jest.Mock;

import { Story } from '@/app/graphql/story.queries';

const makeStory = (overrides: Partial<Story> = {}): Story => ({
    id: 'story-1',
    user: { id: 'user-1', username: 'ali', fullName: 'علی', avatar: null },
    mediaUrl: 'http://x.com/a.jpg',
    mediaType: 'image',
    visibility: 'FOLLOWERS',
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
    viewsCount: 0,
    isViewedByMe: false,
    viewers: [],
    ...overrides,
});

describe('useStoryViewer', () => {
    let viewStoryMock: jest.Mock;
    let onClose: jest.Mock;
    let onStoryViewed: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        viewStoryMock = jest.fn().mockResolvedValue({ data: {}, error: undefined });
        onClose = jest.fn();
        onStoryViewed = jest.fn();

        mockedUseMutation.mockReturnValue([viewStoryMock]);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // ==========================================================
    //  مقداردهی اولیه
    // ==========================================================
    it('currentIndex را با initialIndex مقداردهی می‌کند', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 1, isOwner: false, isOpen: true, onClose })
        );

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.currentStory.id).toBe('s2');
    });

    it('isVideo را بر اساس mediaType درست تشخیص می‌دهد', () => {
        const stories = [makeStory({ mediaType: 'video' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose })
        );

        expect(result.current.isVideo).toBe(true);
    });

    // ==========================================================
    //  goToNext / goToPrev
    // ==========================================================
    it('goToNext به استوری بعدی می‌رود و progress را ریست می‌کند', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose })
        );

        act(() => {
            result.current.goToNext();
        });

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.progress).toBe(0);
    });

    it('goToNext روی آخرین استوری، onClose را صدا می‌زند', () => {
        const stories = [makeStory({ id: 's1' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose })
        );

        act(() => {
            result.current.goToNext();
        });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(result.current.currentIndex).toBe(0); // تغییر نکرده
    });

    it('goToPrev به استوری قبلی می‌رود', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 1, isOwner: false, isOpen: true, onClose })
        );

        act(() => {
            result.current.goToPrev();
        });

        expect(result.current.currentIndex).toBe(0);
    });

    it('goToPrev روی اولین استوری کاری انجام نمی‌دهد', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose })
        );

        act(() => {
            result.current.goToPrev();
        });

        expect(result.current.currentIndex).toBe(0);
        expect(onClose).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  ثبت بازدید
    // ==========================================================
    it('برای بیننده‌ی غیرمالک که استوری را ندیده، viewStory صدا زده می‌شود', async () => {
        const stories = [makeStory({ id: 's1', isViewedByMe: false })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose, onStoryViewed })
        );

        await waitFor(() => {
            expect(viewStoryMock).toHaveBeenCalledWith({ variables: { storyId: 's1' } });
        });
    });

    it('اگر استوری قبلاً دیده شده باشد، viewStory صدا زده نمی‌شود', () => {
        const stories = [makeStory({ id: 's1', isViewedByMe: true })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose, onStoryViewed })
        );

        expect(viewStoryMock).not.toHaveBeenCalled();
    });

    it('اگر isOwner=true باشد، viewStory هرگز صدا زده نمی‌شود', () => {
        const stories = [makeStory({ id: 's1', isViewedByMe: false })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose, onStoryViewed })
        );

        expect(viewStoryMock).not.toHaveBeenCalled();
    });

    it('اگر isOpen=false باشد، viewStory صدا زده نمی‌شود', () => {
        const stories = [makeStory({ id: 's1', isViewedByMe: false })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: false, onClose, onStoryViewed })
        );

        expect(viewStoryMock).not.toHaveBeenCalled();
    });

    it('بعد از ثبت موفق بازدید، onStoryViewed با storyId صدا زده می‌شود', async () => {
        const stories = [makeStory({ id: 's1', isViewedByMe: false })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose, onStoryViewed })
        );

        await waitFor(() => {
            expect(onStoryViewed).toHaveBeenCalledWith('s1');
        });
    });

    it('با رفتن به استوری بعدی، بازدید استوری جدید هم ثبت می‌شود', async () => {
        const stories = [
            makeStory({ id: 's1', isViewedByMe: false }),
            makeStory({ id: 's2', isViewedByMe: false }),
        ];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: false, isOpen: true, onClose, onStoryViewed })
        );

        await waitFor(() => expect(viewStoryMock).toHaveBeenCalledWith({ variables: { storyId: 's1' } }));

        act(() => {
            result.current.goToNext();
        });

        await waitFor(() => expect(viewStoryMock).toHaveBeenCalledWith({ variables: { storyId: 's2' } }));
    });

    // ==========================================================
    //  Progress برای عکس (تایمر)
    // ==========================================================
    it('برای عکس، progress با گذشت زمان افزایش می‌یابد', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'image' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        expect(result.current.progress).toBe(0);

        act(() => {
            jest.advanceTimersByTime(2500); // نیمه‌ی مسیر ۵ ثانیه
        });

        expect(result.current.progress).toBeGreaterThan(40);
        expect(result.current.progress).toBeLessThan(60);
    });

    it('بعد از ۵ ثانیه کامل، به استوری بعدی می‌رود', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'image' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            jest.advanceTimersByTime(5100);
        });

        expect(result.current.currentIndex).toBe(1);
    });

    it('وقتی isPaused=true باشد، progress افزایش پیدا نمی‌کند', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'image' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            result.current.setIsPaused(true);
        });

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(result.current.progress).toBe(0);
    });

    // ==========================================================
    //  Progress برای ویدیو
    // ==========================================================
    it('برای ویدیو، progress بر اساس currentTime/duration محاسبه می‌شود', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'video' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        // ✅ شبیه‌سازی عنصر video
        const fakeVideo = document.createElement('video');
        Object.defineProperty(fakeVideo, 'duration', { value: 10, configurable: true });
        Object.defineProperty(fakeVideo, 'currentTime', { value: 5, configurable: true });

        act(() => {
            (result.current.videoRef as any).current = fakeVideo;
        });

        act(() => {
            fakeVideo.dispatchEvent(new Event('timeupdate'));
        });

        expect(result.current.progress).toBe(50);
    });

    it('با پایان یافتن ویدیو (ended)، به استوری بعدی می‌رود', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'video' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        const fakeVideo = document.createElement('video');

        act(() => {
            (result.current.videoRef as any).current = fakeVideo;
        });

        act(() => {
            fakeVideo.dispatchEvent(new Event('ended'));
        });

        expect(result.current.currentIndex).toBe(1);
    });

    // ==========================================================
    //  کلیدهای میانبر
    // ==========================================================
    it('کلید Escape باعث صدا زده شدن onClose می‌شود', () => {
        const stories = [makeStory({ id: 's1' })];
        renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('کلید ArrowRight باعث رفتن به استوری بعدی می‌شود', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        });

        expect(result.current.currentIndex).toBe(1);
    });

    it('کلید ArrowLeft باعث رفتن به استوری قبلی می‌شود', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 1, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        });

        expect(result.current.currentIndex).toBe(0);
    });

    it('وقتی isOpen=false باشد، کلیدهای میانبر اثری ندارند', () => {
        const stories = [makeStory({ id: 's1' }), makeStory({ id: 's2' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: false, onClose })
        );

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        });

        expect(result.current.currentIndex).toBe(0);
        expect(onClose).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  پاکسازی (cleanup)
    // ==========================================================
    it('هنگام unmount، event listener کیبورد حذف می‌شود', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const stories = [makeStory({ id: 's1' })];
        const { unmount } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });

    it('تغییر currentIndex تایمر قبلی را پاک کرده و تایمر جدید می‌سازد (تداخل progress رخ نمی‌دهد)', () => {
        const stories = [makeStory({ id: 's1', mediaType: 'image' }), makeStory({ id: 's2', mediaType: 'image' })];
        const { result } = renderHook(() =>
            useStoryViewer({ stories, initialIndex: 0, isOwner: true, isOpen: true, onClose })
        );

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        act(() => {
            result.current.goToNext();
        });

        // ✅ progress باید از صفر شروع بشه برای استوری دوم، نه ادامه‌ی قبلی
        expect(result.current.progress).toBe(0);

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // باید فقط معادل ۲ ثانیه پیشرفت کرده باشه، نه تجمعی از تایمر قبلی
        expect(result.current.progress).toBeLessThan(45);
    });
});