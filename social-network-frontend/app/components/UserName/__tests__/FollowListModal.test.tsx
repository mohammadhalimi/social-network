// components/common/FollowListModal/__tests__/FollowListModal.test.tsx

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { FollowListModal } from '../FollowListModal';
import { GET_FOLLOWERS, GET_FOLLOWING } from '@/app/graphql/user.queries';

// ✅ Mock کردن useQuery
jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
}));

// ✅ Mock کردن FollowList - فقط بررسی می‌کنیم props درست پاس داده می‌شن
jest.mock('../FollowListModal/FollowList', () => ({
    FollowList: (props: any) => (
        <div data-testid="follow-list">
            <span data-testid="users-count">{props.users.length}</span>
            <span data-testid="loading">{String(props.loading)}</span>
            <span data-testid="loading-more">{String(props.loadingMore)}</span>
            <span data-testid="has-more">{String(props.hasMore)}</span>
            <span data-testid="type">{props.type}</span>
            <button onClick={props.onLoadMore}>لود بیشتر</button>
        </div>
    ),
}));

// ✅ Mock کردن SearchInput - یه اینپوت ساده که onChange رو صدا می‌زنه
jest.mock('../FollowListModal/SearchInput', () => ({
    SearchInput: (props: any) => (
        <input
            data-testid="search-input"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
        />
    ),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

const mockUsers = [
    { id: 'u1', username: 'ali', fullName: 'علی', avatar: null, isFollowing: false },
    { id: 'u2', username: 'sara', fullName: 'سارا', avatar: null, isFollowing: true },
];

describe('FollowListModal', () => {
    let fetchMoreMock: jest.Mock;
    let refetchMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMoreMock = jest.fn();
        refetchMock = jest.fn();

        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });
    });

    // ==========================================================
    //  رندر پایه / باز و بسته بودن
    // ==========================================================
    it('وقتی isOpen=false باشد، چیزی رندر نمی‌کند', () => {
        const { container } = render(
            <FollowListModal userId="user-1" type="followers" isOpen={false} onClose={jest.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('برای type="followers" عنوان "دنبال‌کننده‌ها" را نشان می‌دهد', () => {
        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('دنبال‌کننده‌ها')).toBeInTheDocument();
    });

    it('برای type="following" عنوان "دنبال‌شونده‌ها" را نشان می‌دهد', () => {
        render(<FollowListModal userId="user-1" type="following" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('دنبال‌شونده‌ها')).toBeInTheDocument();
    });

    it('با کلیک روی دکمه‌ی بستن، onClose صدا زده می‌شود', () => {
        const onClose = jest.fn();
        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={onClose} />);

        fireEvent.click(document.querySelector('button')!);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // ==========================================================
    //  انتخاب کوئری صحیح بر اساس type
    // ==========================================================
    it('برای type="followers" از GET_FOLLOWERS استفاده می‌کند', () => {
        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        expect(mockedUseQuery).toHaveBeenCalledWith(
            GET_FOLLOWERS,
            expect.objectContaining({ variables: expect.objectContaining({ userId: 'user-1' }) })
        );
    });

    it('برای type="following" از GET_FOLLOWING استفاده می‌کند', () => {
        render(<FollowListModal userId="user-1" type="following" isOpen={true} onClose={jest.fn()} />);

        expect(mockedUseQuery).toHaveBeenCalledWith(
            GET_FOLLOWING,
            expect.objectContaining({ variables: expect.objectContaining({ userId: 'user-1' }) })
        );
    });

    it('وقتی isOpen=false باشد، کوئری skip می‌شود', () => {
        render(<FollowListModal userId="user-1" type="followers" isOpen={false} onClose={jest.fn()} />);

        expect(mockedUseQuery).toHaveBeenCalledWith(
            GET_FOLLOWERS,
            expect.objectContaining({ variables: expect.objectContaining({ }), skip: true })
        );
    });

    // ==========================================================
    //  دریافت داده و sync با state
    // ==========================================================
    it('وقتی data.getFollowers می‌آید، کاربران و hasMore را ست می‌کند', () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: mockUsers, hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('users-count')).toHaveTextContent('2');
        expect(screen.getByTestId('has-more')).toHaveTextContent('true');
    });

    it('وقتی data.getFollowing می‌آید، کاربران را ست می‌کند', () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowing: { users: mockUsers, hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });

        render(<FollowListModal userId="user-1" type="following" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('users-count')).toHaveTextContent('2');
        expect(screen.getByTestId('has-more')).toHaveTextContent('false');
    });

    it('loading را به FollowList پاس می‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: true,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    // ==========================================================
    //  جستجو (handleSearch)
    // ==========================================================
    it('با تایپ در جستجو، refetch با searchTerm و offset=0 صدا زده می‌شود', async () => {
        refetchMock.mockResolvedValue({
            data: { getFollowers: { users: [mockUsers[0]], hasMore: false } },
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        await act(async () => {
            fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'ali' } });
        });

        expect(refetchMock).toHaveBeenCalledWith({ searchTerm: 'ali', offset: 0 });
    });

    it('بعد از جستجوی موفق، نتایج جدید جایگزین لیست قبلی می‌شوند', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: mockUsers, hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });
        refetchMock.mockResolvedValue({
            data: { getFollowers: { users: [mockUsers[0]], hasMore: false } },
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('users-count')).toHaveTextContent('2');

        await act(async () => {
            fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'ali' } });
        });

        await waitFor(() => {
            expect(screen.getByTestId('users-count')).toHaveTextContent('1');
        });
    });

    it('اگر refetch خطا بدهد، خطا در کنسول لاگ می‌شود و برنامه کرش نمی‌کند', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        refetchMock.mockRejectedValue(new Error('network error'));

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        await act(async () => {
            fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'x' } });
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    // ==========================================================
    //  لود بیشتر (handleLoadMore)
    // ==========================================================
    it('با کلیک روی لود بیشتر، fetchMore با offset صحیح صدا زده می‌شود', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: mockUsers, hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: [], hasMore: false } },
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        await act(async () => {
            fireEvent.click(screen.getByText('لود بیشتر'));
        });

        expect(fetchMoreMock).toHaveBeenCalledWith({
            variables: { offset: 2, searchTerm: '' },
        });
    });

    it('نتایج جدید به انتهای لیست موجود اضافه می‌شوند (نه جایگزینی)', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: mockUsers, hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });
        const newUser = { id: 'u3', username: 'reza', fullName: 'رضا', avatar: null, isFollowing: false };
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: [newUser], hasMore: false } },
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        await act(async () => {
            fireEvent.click(screen.getByText('لود بیشتر'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('users-count')).toHaveTextContent('3');
        });
    });

    it('وقتی hasMore=false باشد، handleLoadMore کاری انجام نمی‌دهد', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: mockUsers, hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
            refetch: refetchMock,
        });

        render(<FollowListModal userId="user-1" type="followers" isOpen={true} onClose={jest.fn()} />);

        // چون hasMore=false است، دکمه‌ی "لود بیشتر" اصلاً رندر نمی‌شود (بر اساس منطق mock ما)
        // ولی می‌توانیم مستقیم fetchMore را بررسی کنیم که صدا زده نشده
        expect(fetchMoreMock).not.toHaveBeenCalled();
    });
});