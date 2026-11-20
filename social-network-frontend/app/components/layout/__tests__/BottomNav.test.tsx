import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BottomNav } from '../BottomNav';

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/app/redux/hooks';
import { useNotifications } from '@/app/hooks/useNotifications';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));
jest.mock('@/app/redux/hooks', () => ({ useAppSelector: jest.fn() }));
jest.mock('@/app/hooks/useNotifications', () => ({ useNotifications: jest.fn() }));
jest.mock('@/app/lib/utils/avatar', () => ({
    getAvatarUrl: (avatar: string) => `/uploads/${avatar}`,
}));

type TestUser = { fullName: string; avatar: string | null } | null;

interface SetupOptions {
    pathname?: string;
    user?: TestUser;
    unreadCount?: number;
}

const defaultUser: TestUser = { fullName: 'علی', avatar: null };
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseAppSelector = jest.mocked(useAppSelector);
const mockedUseNotifications = jest.mocked(useNotifications);

const setup = ({
    pathname = '/',
    user = defaultUser,
    unreadCount = 0,
}: SetupOptions = {}) => {
    mockedUsePathname.mockReturnValue(pathname);
    mockedUseAppSelector.mockImplementation((selector: any) =>
        selector({ auth: { user } })
    );
    mockedUseNotifications.mockReturnValue({ unreadCount } as any);
    return render(<BottomNav />);
};

const links = [
    { label: 'خانه', href: '/' },
    { label: 'جستجو', href: '/search' },
    { label: 'اعلان‌ها', href: '/notifications' },
    { label: 'پروفایل', href: '/profile' },
];

describe('BottomNav', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('شرط‌های رندر', () => {
        it('در مسیر /auth رندر نمی‌شود', () => {
            const { container } = setup({ pathname: '/auth' });
            expect(container).toBeEmptyDOMElement();
        });

        it('در زیرمسیرهای auth رندر نمی‌شود', () => {
            const { container } = setup({ pathname: '/auth/login' });
            expect(container).toBeEmptyDOMElement();
        });

        it('اگر کاربر لاگین نکرده باشد رندر نمی‌شود', () => {
            const { container } = setup({ user: null });
            expect(container).toBeEmptyDOMElement();
        });

        it('برای کاربر لاگین‌کرده در مسیر عادی رندر می‌شود', () => {
            setup({ pathname: '/' });
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
    });

    describe('لینک‌ها و دسترس‌پذیری', () => {
        it.each(links)('لینک «$label» href و aria-label درست دارد', ({ label, href }) => {
            setup();
            const link = screen.getByLabelText(label);
            expect(link).toHaveAttribute('href', href);
        });

        it('هر چهار لینک نمایش داده می‌شوند', () => {
            setup();
            expect(screen.getAllByRole('link')).toHaveLength(4);
        });
    });

    describe('وضعیت فعال', () => {
        it.each(links)('در مسیر $href فقط لینک «$label» فعال است', ({ label, href }) => {
            setup({ pathname: href });

            links.forEach((l) => {
                const el = screen.getByLabelText(l.label);
                if (l.label === label) {
                    expect(el).toHaveClass('text-primary');
                } else {
                    expect(el).not.toHaveClass('text-primary');
                }
            });
        });

        it('در زیرمسیرها (مثل /profile/edit) هیچ تبی فعال نیست (رفتار فعلی کد)', () => {
            setup({ pathname: '/profile/edit' });

            links.forEach((l) => {
                expect(screen.getByLabelText(l.label)).not.toHaveClass('text-primary');
            });
        });

        it('تب‌های غیرفعال کلاس رنگ ثانویه دارند', () => {
            setup({ pathname: '/' });
            expect(screen.getByLabelText('جستجو')).toHaveClass('text-secondary');
        });
    });

    describe('نشانگر اعلان‌های خوانده‌نشده', () => {
        it('اگر unreadCount برابر 0 باشد badge نمایش داده نمی‌شود', () => {
            setup({ unreadCount: 0 });
            expect(screen.queryByText('0')).not.toBeInTheDocument();
            expect(screen.queryByText('9+')).not.toBeInTheDocument();
        });

        it('عدد دقیق را برای مقدار کوچک نمایش می‌دهد', () => {
            setup({ unreadCount: 5 });
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('برای مقدار 9 همان عدد 9 را نمایش می‌دهد (حالت مرزی)', () => {
            setup({ unreadCount: 9 });
            expect(screen.getByText('9')).toBeInTheDocument();
            expect(screen.queryByText('9+')).not.toBeInTheDocument();
        });

        it('برای مقدار 10 عبارت 9+ را نمایش می‌دهد (حالت مرزی)', () => {
            setup({ unreadCount: 10 });
            expect(screen.getByText('9+')).toBeInTheDocument();
        });

        it('برای مقادیر خیلی بزرگ هم 9+ را نمایش می‌دهد', () => {
            setup({ unreadCount: 250 });
            expect(screen.getByText('9+')).toBeInTheDocument();
        });

        it('badge داخل لینک اعلان‌ها قرار دارد', () => {
            setup({ unreadCount: 3 });
            const notifLink = screen.getByLabelText('اعلان‌ها');
            expect(notifLink).toContainElement(screen.getByText('3'));
        });
    });

    describe('آواتار', () => {
        it('اگر avatar وجود داشته باشد تصویر با src و alt درست رندر می‌شود', () => {
            setup({ user: { fullName: 'علی رضایی', avatar: 'ali.png' } });

            const img = screen.getByAltText('علی رضایی');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', '/uploads/ali.png');
        });

        it('بدون avatar، حرف اول نام نمایش داده می‌شود', () => {
            setup({ user: { fullName: 'علی', avatar: null } });

            expect(screen.getByText('ع')).toBeInTheDocument();
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });

        it('بدون avatar و با fullName خالی، ایموجی پیش‌فرض نمایش داده می‌شود', () => {
            setup({ user: { fullName: '', avatar: null } });

            expect(screen.getByText('👤')).toBeInTheDocument();
        });

        it('آواتار داخل لینک پروفایل قرار دارد', () => {
            setup({ user: { fullName: 'علی', avatar: null } });

            const profileLink = screen.getByLabelText('پروفایل');
            expect(profileLink).toContainElement(screen.getByText('ع'));
        });
    });
});