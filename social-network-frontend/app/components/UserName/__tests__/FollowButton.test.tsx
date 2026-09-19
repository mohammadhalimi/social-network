import toast from 'react-hot-toast';
import { FollowButton } from '../FollowButton';
import { useMutation } from '@apollo/client/react';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/app/graphql/user.queries';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';


jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

const mockedUseMutation = useMutation as unknown as jest.Mock;

describe('FollowButton', () => {
    let followUserMock: jest.Mock;
    let unfollowUserMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        followUserMock = jest.fn();
        unfollowUserMock = jest.fn();

        // ✅ بر اساس نوع کوئری تشخیص بده کدوم mock رو برگردونه (نه بر اساس شماره‌ی فراخوانی)
        mockedUseMutation.mockImplementation((mutation: any) => {
            if (mutation === FOLLOW_USER) {
                return [followUserMock];
            }
            if (mutation === UNFOLLOW_USER) {
                return [unfollowUserMock];
            }
            return [jest.fn()];
        });
    });

    // ==========================================================
    //  رندر پایه
    // ==========================================================
    it('وقتی initialIsFollowing=false است، متن "دنبال کردن" را نشان می‌دهد', () => {
        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        expect(screen.getByText('دنبال کردن')).toBeInTheDocument();
    });

    it('وقتی initialIsFollowing=true است، متن "دنبال می‌کنید" را نشان می‌دهد', () => {
        render(<FollowButton userId="user-1" initialIsFollowing={true} />);

        expect(screen.getByText('دنبال می‌کنید')).toBeInTheDocument();
    });

    // ==========================================================
    //  فالو کردن (موفق)
    // ==========================================================
    it('با کلیک روی دکمه در حالت follow، followUser با userId صدا زده می‌شود', async () => {
        followUserMock.mockResolvedValue({
            data: { followUser: { success: true, followersCount: 10 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(followUserMock).toHaveBeenCalledWith({ variables: { userId: 'user-1' } });
        });
    });

    it('بعد از فالو موفق، متن دکمه به "دنبال می‌کنید" تغییر می‌کند', async () => {
        followUserMock.mockResolvedValue({
            data: { followUser: { success: true, followersCount: 10 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(screen.getByText('دنبال می‌کنید')).toBeInTheDocument();
        });
    });

    it('بعد از فالو موفق، onFollowChange با (true, followersCount) صدا زده می‌شود', async () => {
        const onFollowChange = jest.fn();
        followUserMock.mockResolvedValue({
            data: { followUser: { success: true, followersCount: 42 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={false} onFollowChange={onFollowChange} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(onFollowChange).toHaveBeenCalledWith(true, 42);
        });
    });

    // ==========================================================
    //  آنفالو کردن (موفق)
    // ==========================================================
    it('وقتی از قبل فالو شده، کلیک باعث صدا زده شدن unfollowUser می‌شود', async () => {
        unfollowUserMock.mockResolvedValue({
            data: { unfollowUser: { success: true, followersCount: 9 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={true} />);

        fireEvent.click(screen.getByText('دنبال می‌کنید'));

        await waitFor(() => {
            expect(unfollowUserMock).toHaveBeenCalledWith({ variables: { userId: 'user-1' } });
        });
    });

    it('بعد از آنفالو موفق، متن دکمه به "دنبال کردن" برمی‌گردد', async () => {
        unfollowUserMock.mockResolvedValue({
            data: { unfollowUser: { success: true, followersCount: 9 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={true} />);

        fireEvent.click(screen.getByText('دنبال می‌کنید'));

        await waitFor(() => {
            expect(screen.getByText('دنبال کردن')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  خطای GraphQL - وضعیت نباید تغییر کند
    // ==========================================================
    it('در صورت خطای GraphQL هنگام فالو، وضعیت دکمه تغییر نمی‌کند و toast خطا نمایش داده می‌شود', async () => {
        followUserMock.mockResolvedValue({
            data: undefined,
            error: { message: 'خطای سرور' },
        });

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطای سرور');
        });

        expect(screen.getByText('دنبال کردن')).toBeInTheDocument();
    });

    it('در صورت success=false از سرور، toast با پیام سرور نمایش داده می‌شود و state تغییر نمی‌کند', async () => {
        followUserMock.mockResolvedValue({
            data: { followUser: { success: false, message: 'قبلاً بلاک شده‌اید', followersCount: 10 } },
            error: undefined,
        });

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('قبلاً بلاک شده‌اید');
        });

        expect(screen.getByText('دنبال کردن')).toBeInTheDocument();
    });

    it('در صورت خطای شبکه (reject شدن promise)، toast خطا نمایش داده می‌شود', async () => {
        followUserMock.mockRejectedValue(new Error('Network error'));

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Network error');
        });
    });

    // ==========================================================
    //  جلوگیری از کلیک تکراری در حین لودینگ
    // ==========================================================
    it('در حین لودینگ، دکمه غیرفعال می‌شود', async () => {
        let resolveMutation: any;
        followUserMock.mockReturnValue(
            new Promise((resolve) => {
                resolveMutation = resolve;
            })
        );

        render(<FollowButton userId="user-1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByText('دنبال کردن'));

        await waitFor(() => {
            expect(screen.getByRole('button')).toBeDisabled();
        });

        resolveMutation({ data: { followUser: { success: true, followersCount: 1 } }, error: undefined });
    });
});