// components/story/CloseFriendsSelector/__tests__/useCloseFriendsSelection.test.tsx

import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@apollo/client/react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCloseFriendsSelection } from '../useCloseFriendsSelection';

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;
const mockedUseMutation = useMutation as unknown as jest.Mock;

const mockCloseFriends = [
    { id: 'friend-1', username: 'ali', fullName: 'علی', avatar: null },
    { id: 'friend-2', username: 'sara', fullName: 'سارا', avatar: null },
];

describe('useCloseFriendsSelection', () => {
    let refetchCloseMock: jest.Mock;
    let addCloseFriendMock: jest.Mock;
    let removeCloseFriendMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        refetchCloseMock = jest.fn().mockResolvedValue({});
        addCloseFriendMock = jest.fn().mockResolvedValue({ data: {}, error: undefined });
        removeCloseFriendMock = jest.fn().mockResolvedValue({ data: {}, error: undefined });

        mockedUseQuery.mockReturnValue({
            data: { getCloseFriends: mockCloseFriends },
            refetch: refetchCloseMock,
        });

        mockedUseMutation
            .mockReturnValueOnce([addCloseFriendMock])
            .mockReturnValueOnce([removeCloseFriendMock]);
    });

    // ==========================================================
    //  مقداردهی اولیه
    // ==========================================================
    it('selectedIds را با close friends فعلی مقداردهی می‌کند', () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        expect(result.current.selectedIds.has('friend-1')).toBe(true);
        expect(result.current.selectedIds.has('friend-2')).toBe(true);
        expect(result.current.selectedIds.size).toBe(2);
    });

    it('وقتی close friends خالی باشد، selectedIds خالی می‌ماند', () => {
        mockedUseQuery.mockReturnValue({
            data: { getCloseFriends: [] },
            refetch: refetchCloseMock,
        });

        const { result } = renderHook(() => useCloseFriendsSelection());

        expect(result.current.selectedIds.size).toBe(0);
    });

    // ==========================================================
    //  toggle
    // ==========================================================
    it('toggle یک id جدید را اضافه می‌کند', () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-3');
        });

        expect(result.current.selectedIds.has('friend-3')).toBe(true);
        expect(result.current.selectedIds.size).toBe(3);
    });

    it('toggle یک id موجود را حذف می‌کند', () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-1');
        });

        expect(result.current.selectedIds.has('friend-1')).toBe(false);
        expect(result.current.selectedIds.size).toBe(1);
    });

    // ==========================================================
    //  onChange callback
    // ==========================================================
    it('onChange را با تعداد انتخاب‌شده صدا می‌زند', () => {
        const onChange = jest.fn();
        renderHook(() => useCloseFriendsSelection(onChange));

        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('onChange بعد از toggle دوباره با مقدار جدید صدا زده می‌شود', () => {
        const onChange = jest.fn();
        const { result } = renderHook(() => useCloseFriendsSelection(onChange));

        act(() => {
            result.current.toggle('friend-3');
        });

        expect(onChange).toHaveBeenLastCalledWith(3);
    });

    // ==========================================================
    //  save: محاسبه‌ی toAdd/toRemove
    // ==========================================================
    it('save فقط افراد جدید انتخاب‌شده را اضافه می‌کند (toAdd)', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-3'); // جدید اضافه شد
        });

        await act(async () => {
            await result.current.save();
        });

        expect(addCloseFriendMock).toHaveBeenCalledWith({ variables: { userId: 'friend-3' } });
        expect(addCloseFriendMock).toHaveBeenCalledTimes(1);
        expect(removeCloseFriendMock).not.toHaveBeenCalled();
    });

    it('save فقط افراد حذف‌شده را حذف می‌کند (toRemove)', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-1'); // حذف شد
        });

        await act(async () => {
            await result.current.save();
        });

        expect(removeCloseFriendMock).toHaveBeenCalledWith({ variables: { userId: 'friend-1' } });
        expect(removeCloseFriendMock).toHaveBeenCalledTimes(1);
        expect(addCloseFriendMock).not.toHaveBeenCalled();
    });

    it('save هم افراد اضافه‌شده هم حذف‌شده را به‌درستی تفکیک می‌کند', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-1'); // حذف
            result.current.toggle('friend-3'); // اضافه
        });

        await act(async () => {
            await result.current.save();
        });

        expect(addCloseFriendMock).toHaveBeenCalledWith({ variables: { userId: 'friend-3' } });
        expect(removeCloseFriendMock).toHaveBeenCalledWith({ variables: { userId: 'friend-1' } });
    });

    it('اگر هیچ تغییری نکرده باشد، نه add نه remove صدا زده می‌شود', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        await act(async () => {
            await result.current.save();
        });

        expect(addCloseFriendMock).not.toHaveBeenCalled();
        expect(removeCloseFriendMock).not.toHaveBeenCalled();
    });

    it('toggle کردن یک id و برگرداندنش به حالت اول، آن را از toAdd/toRemove حذف می‌کند', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-3'); // اضافه
            result.current.toggle('friend-3'); // دوباره حذف - یعنی برگشت به حالت اول
        });

        await act(async () => {
            await result.current.save();
        });

        expect(addCloseFriendMock).not.toHaveBeenCalled();
        expect(removeCloseFriendMock).not.toHaveBeenCalled();
    });

    it('بعد از save موفق، refetchClose صدا زده می‌شود و toast success نشان داده می‌شود', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-3');
        });

        await act(async () => {
            await result.current.save();
        });

        expect(refetchCloseMock).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith('لیست دوستان نزدیک ذخیره شد ✅');
    });

    it('در صورت خطا هنگام save، toast error نشان داده می‌شود', async () => {
        addCloseFriendMock.mockRejectedValue(new Error('خطای شبکه'));

        const { result } = renderHook(() => useCloseFriendsSelection());

        act(() => {
            result.current.toggle('friend-3');
        });

        await act(async () => {
            await result.current.save();
        });

        expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
    });

    it('isSaving در حین save برابر true و بعد از اتمام false است', async () => {
        const { result } = renderHook(() => useCloseFriendsSelection());

        expect(result.current.isSaving).toBe(false);

        const savePromise = act(async () => {
            const promise = result.current.save();
            // بلافاصله بعد از فراخوانی save، باید true باشد
            await waitFor(() => expect(result.current.isSaving).toBe(true));
            await promise;
        });

        await savePromise;

        expect(result.current.isSaving).toBe(false);
    });
});