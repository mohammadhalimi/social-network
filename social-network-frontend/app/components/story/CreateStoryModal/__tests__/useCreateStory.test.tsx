// components/story/CreateStoryModal/__tests__/useCreateStory.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { useCreateStory } from '../useCreateStory';
import { uploadStoryMedia } from '@/app/lib/uploadStory';

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

jest.mock('@/app/lib/uploadStory', () => ({
    uploadStoryMedia: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockedUseMutation = useMutation as unknown as jest.Mock;
const mockedUploadStoryMedia = uploadStoryMedia as jest.Mock;

// ✅ کمک‌کننده برای ساخت فایل جعلی
const makeFile = (type: string, name = 'file.jpg') => {
    return new File(['content'], name, { type });
};

describe('useCreateStory', () => {
    let createStoryMock: jest.Mock;
    let onSuccess: jest.Mock;
    let onClose: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // ✅ Mock کردن URL.createObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

        createStoryMock = jest.fn();
        onSuccess = jest.fn();
        onClose = jest.fn();

        mockedUseMutation.mockReturnValue([createStoryMock]);
        mockedUploadStoryMedia.mockResolvedValue('http://localhost:4000/uploads/stories/x.jpg');
    });

    // ==========================================================
    //  مقادیر پیش‌فرض
    // ==========================================================
    it('مقادیر پیش‌فرض درستی برمی‌گرداند', () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        expect(result.current.file).toBeNull();
        expect(result.current.previewUrl).toBeNull();
        expect(result.current.mediaType).toBe('image');
        expect(result.current.duration).toBe('TWENTY_FOUR_HOURS');
        expect(result.current.visibility).toBe('FOLLOWERS');
        expect(result.current.isUploading).toBe(false);
        expect(result.current.closeFriendsCount).toBe(0);
    });

    // ==========================================================
    //  selectFile
    // ==========================================================
    it('selectFile یک فایل تصویری را با mediaType=image ست می‌کند', () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));
        const file = makeFile('image/png');

        act(() => {
            result.current.selectFile(file);
        });

        expect(result.current.file).toBe(file);
        expect(result.current.mediaType).toBe('image');
        expect(result.current.previewUrl).toMatch(/^blob:/);
    });

    it('selectFile یک فایل ویدیویی را با mediaType=video ست می‌کند', () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));
        const file = makeFile('video/mp4', 'clip.mp4');

        act(() => {
            result.current.selectFile(file);
        });

        expect(result.current.mediaType).toBe('video');
    });

    // ==========================================================
    //  clearFile
    // ==========================================================
    it('clearFile فایل و پیش‌نمایش را پاک می‌کند', () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });
        expect(result.current.file).not.toBeNull();

        act(() => {
            result.current.clearFile();
        });

        expect(result.current.file).toBeNull();
        expect(result.current.previewUrl).toBeNull();
    });

    // ==========================================================
    //  submit: validation
    // ==========================================================
    it('اگر فایلی انتخاب نشده باشد، toast خطا نشان می‌دهد و ادامه نمی‌دهد', async () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.error).toHaveBeenCalledWith('لطفاً یک عکس یا ویدیو انتخاب کنید');
        expect(mockedUploadStoryMedia).not.toHaveBeenCalled();
        expect(createStoryMock).not.toHaveBeenCalled();
    });

    it('اگر visibility=CLOSE_FRIENDS و closeFriendsCount=0 باشد، toast خطا نشان می‌دهد', async () => {
        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
            result.current.setVisibility('CLOSE_FRIENDS');
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.error).toHaveBeenCalledWith('لطفاً حداقل یک دوست نزدیک انتخاب کنید');
        expect(mockedUploadStoryMedia).not.toHaveBeenCalled();
    });

    it('اگر visibility=CLOSE_FRIENDS ولی closeFriendsCount>0 باشد، ادامه می‌دهد', async () => {
        createStoryMock.mockResolvedValue({
            data: { createStory: { success: true, message: 'ok', story: {} } },
            error: undefined,
        });

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
            result.current.setVisibility('CLOSE_FRIENDS');
            result.current.setCloseFriendsCount(2);
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(mockedUploadStoryMedia).toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  submit: مسیر موفق
    // ==========================================================
    it('در صورت موفقیت، uploadStoryMedia و createStory با مقادیر درست صدا زده می‌شوند', async () => {
        createStoryMock.mockResolvedValue({
            data: { createStory: { success: true, message: 'ok', story: {} } },
            error: undefined,
        });

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));
        const file = makeFile('image/png');

        act(() => {
            result.current.selectFile(file);
            result.current.setDuration('SIX_HOURS');
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(mockedUploadStoryMedia).toHaveBeenCalledWith(file);
        expect(createStoryMock).toHaveBeenCalledWith({
            variables: {
                mediaUrl: 'http://localhost:4000/uploads/stories/x.jpg',
                mediaType: 'image',
                duration: 'SIX_HOURS',
                visibility: 'FOLLOWERS',
            },
        });
    });

    it('در صورت موفقیت، toast success نشان داده و onSuccess/onClose صدا زده می‌شوند', async () => {
        createStoryMock.mockResolvedValue({
            data: { createStory: { success: true, message: 'ok', story: {} } },
            error: undefined,
        });

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.success).toHaveBeenCalledWith('استوری با موفقیت منتشر شد! ✅');
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // ==========================================================
    //  submit: خطای GraphQL
    // ==========================================================
    it('اگر error از GraphQL برگردد، toast خطا نشان می‌دهد و onSuccess/onClose صدا زده نمی‌شوند', async () => {
        createStoryMock.mockResolvedValue({
            data: undefined,
            error: { message: 'خطای سرور' },
        });

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.error).toHaveBeenCalledWith('خطای سرور');
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('اگر success=false از سرور برگردد، toast با پیام سرور نشان داده می‌شود', async () => {
        createStoryMock.mockResolvedValue({
            data: { createStory: { success: false, message: 'مشکل در سرور', story: null } },
            error: undefined,
        });

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.error).toHaveBeenCalledWith('مشکل در سرور');
        expect(onSuccess).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  submit: خطای آپلود (شبکه)
    // ==========================================================
    it('اگر uploadStoryMedia خطا بدهد، toast خطا نشان می‌دهد و createStory صدا زده نمی‌شود', async () => {
        mockedUploadStoryMedia.mockRejectedValue(new Error('خطا در آپلود شبکه'));

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(toast.error).toHaveBeenCalledWith('خطا در آپلود شبکه');
        expect(createStoryMock).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  isUploading
    // ==========================================================
    it('isUploading در حین submit برابر true و بعد از اتمام false است', async () => {
        let resolveCreateStory: any;
        createStoryMock.mockReturnValue(
            new Promise((resolve) => {
                resolveCreateStory = resolve;
            })
        );

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        expect(result.current.isUploading).toBe(false);

        act(() => {
            result.current.submit();
        });

        await waitFor(() => {
            expect(result.current.isUploading).toBe(true);
        });

        await act(async () => {
            resolveCreateStory({
                data: { createStory: { success: true, message: 'ok', story: {} } },
                error: undefined,
            });
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.isUploading).toBe(false);
        });
    });

    it('isUploading حتی در صورت خطا هم در نهایت false می‌شود', async () => {
        mockedUploadStoryMedia.mockRejectedValue(new Error('fail'));

        const { result } = renderHook(() => useCreateStory(onSuccess, onClose));

        act(() => {
            result.current.selectFile(makeFile('image/png'));
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(result.current.isUploading).toBe(false);
    });
});