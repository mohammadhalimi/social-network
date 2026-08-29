// graphql/resolvers/helpers/__tests__/formatPost.test.ts
//
// mapUser جداگانه تست شده (mapUser.test.ts)، پس اینجا mock می‌شود تا
// تست‌های formatPost/formatComment مستقل و متمرکز بر منطق خودشان باشند.

jest.mock('../mapUser', () => ({
    mapUser: jest.fn((user: any) => ({ mapped: true, sourceId: user?.id })),
}));

import { formatPost, formatComment } from '../formatPost';
import { mapUser } from '../mapUser';

const mockedMapUser = mapUser as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

// ===================================================================
// formatPost
// ===================================================================
describe('formatPost', () => {
    test('پستی بدون likes/comments را با مقادیر پیش‌فرض صفر فرمت می‌کند', () => {
        const post = { id: 'post-1', text: 'سلام دنیا', user: { id: 'u1' } };

        const result = formatPost(post);

        expect(result.likesCount).toBe(0);
        expect(result.commentsCount).toBe(0);
        expect(result.isLiked).toBe(false);
        expect(result.comments).toEqual([]);
        expect(result.user).toEqual({ mapped: true, sourceId: 'u1' });
        expect(mockedMapUser).toHaveBeenCalledWith(post.user);
    });

    test('فیلدهای اصلی پست را حفظ می‌کند (spread)', () => {
        const post = { id: 'post-1', text: 'متن پست', createdAt: '2024-01-01', user: {} };

        const result = formatPost(post);

        expect(result.id).toBe('post-1');
        expect(result.text).toBe('متن پست');
        expect(result.createdAt).toBe('2024-01-01');
    });

    test('likesCount و commentsCount را طبق طول آرایه‌ها محاسبه می‌کند', () => {
        const post = {
            id: 'post-1',
            user: {},
            likes: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
            comments: [{ id: 'c1', user: {} }, { id: 'c2', user: {} }],
        };

        const result = formatPost(post);

        expect(result.likesCount).toBe(3);
        expect(result.commentsCount).toBe(2);
    });

    test('اگر userId در بین لایک‌ها باشد، isLiked برابر true است', () => {
        const post = {
            id: 'post-1',
            user: {},
            likes: [{ userId: 'x' }, { userId: 'y' }],
        };

        const result = formatPost(post, 'y');

        expect(result.isLiked).toBe(true);
    });

    test('اگر userId در بین لایک‌ها نباشد، isLiked برابر false است', () => {
        const post = {
            id: 'post-1',
            user: {},
            likes: [{ userId: 'x' }, { userId: 'y' }],
        };

        const result = formatPost(post, 'z');

        expect(result.isLiked).toBe(false);
    });

    test('اگر userId ارسال نشود، isLiked همیشه false است حتی اگر لایک وجود داشته باشد', () => {
        const post = {
            id: 'post-1',
            user: {},
            likes: [{ userId: 'x' }],
        };

        const result = formatPost(post);

        expect(result.isLiked).toBe(false);
    });

    test('هر کامنت را با formatComment فرمت می‌کند و userId را عبور می‌دهد', () => {
        const post = {
            id: 'post-1',
            user: {},
            comments: [
                { id: 'c1', user: { id: 'cu1' }, likes: [{ userId: 'me' }] },
                { id: 'c2', user: { id: 'cu2' }, likes: [] },
            ],
        };

        const result = formatPost(post, 'me');

        expect(result.comments).toHaveLength(2);
        expect(result.comments[0]).toMatchObject({ id: 'c1', likesCount: 1, isLiked: true });
        expect(result.comments[1]).toMatchObject({ id: 'c2', likesCount: 0, isLiked: false });
    });

    test('likes یا comments برابر null هم به آرایه خالی تبدیل می‌شود', () => {
        const post: any = { id: 'post-1', user: {}, likes: null, comments: null };

        const result = formatPost(post);

        expect(result.likesCount).toBe(0);
        expect(result.commentsCount).toBe(0);
        expect(result.comments).toEqual([]);
    });
});

// ===================================================================
// formatComment
// ===================================================================
describe('formatComment', () => {
    test('کامنتی بدون likes/replies را با مقادیر پیش‌فرض صفر فرمت می‌کند', () => {
        const comment = { id: 'c1', text: 'یک کامنت', user: { id: 'u1' } };

        const result = formatComment(comment);

        expect(result.likesCount).toBe(0);
        expect(result.isLiked).toBe(false);
        expect(result.replies).toEqual([]);
        expect(result.user).toEqual({ mapped: true, sourceId: 'u1' });
    });

    test('فیلدهای اصلی کامنت را حفظ می‌کند (spread)', () => {
        const comment = { id: 'c1', text: 'متن کامنت', user: {} };

        const result = formatComment(comment);

        expect(result.id).toBe('c1');
        expect(result.text).toBe('متن کامنت');
    });

    test('likesCount را طبق طول آرایه likes محاسبه می‌کند', () => {
        const comment = { id: 'c1', user: {}, likes: [{ userId: 'a' }, { userId: 'b' }] };

        const result = formatComment(comment);

        expect(result.likesCount).toBe(2);
    });

    test('اگر userId در بین لایک‌های کامنت باشد، isLiked برابر true است', () => {
        const comment = { id: 'c1', user: {}, likes: [{ userId: 'me' }] };

        const result = formatComment(comment, 'me');

        expect(result.isLiked).toBe(true);
    });

    test('اگر userId ارسال نشود، isLiked همیشه false است', () => {
        const comment = { id: 'c1', user: {}, likes: [{ userId: 'me' }] };

        const result = formatComment(comment);

        expect(result.isLiked).toBe(false);
    });

    test('replies را به‌صورت بازگشتی با formatComment فرمت می‌کند', () => {
        const comment = {
            id: 'c1',
            user: {},
            replies: [
                { id: 'r1', user: {}, likes: [{ userId: 'me' }] },
                { id: 'r2', user: {}, likes: [] },
            ],
        };

        const result = formatComment(comment, 'me');

        expect(result.replies).toHaveLength(2);
        expect(result.replies[0]).toMatchObject({ id: 'r1', likesCount: 1, isLiked: true });
        expect(result.replies[1]).toMatchObject({ id: 'r2', likesCount: 0, isLiked: false });
    });

    test('بازگشت چند سطحی (reply داخل reply) را درست فرمت می‌کند', () => {
        const comment = {
            id: 'c1',
            user: {},
            replies: [
                {
                    id: 'r1',
                    user: {},
                    replies: [{ id: 'r1-1', user: {}, likes: [{ userId: 'me' }] }],
                },
            ],
        };

        const result = formatComment(comment, 'me');

        expect(result.replies[0].replies).toHaveLength(1);
        expect(result.replies[0].replies[0]).toMatchObject({ id: 'r1-1', isLiked: true });
    });

    test('likes یا replies برابر null هم به آرایه خالی تبدیل می‌شود', () => {
        const comment: any = { id: 'c1', user: {}, likes: null, replies: null };

        const result = formatComment(comment);

        expect(result.likesCount).toBe(0);
        expect(result.replies).toEqual([]);
    });
});