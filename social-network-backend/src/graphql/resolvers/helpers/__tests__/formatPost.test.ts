// graphql/resolvers/helpers/__tests__/formatPost.test.ts

jest.mock('../mapUser', () => ({
    mapUser: jest.fn((user: any) => ({ mapped: true, sourceId: user?.id })),
}));

import { formatPost, formatComment } from '../formatPost';
import { mapUser } from '../mapUser';

const mockedMapUser = mapUser as jest.Mock;

// ✅ تاریخ‌های پیش‌فرض برای Mock
const ISO_DATE = '2024-01-01T10:00:00.000Z';
const ISO_DATE_UPDATED = '2024-06-15T12:30:00.000Z';

// ✅ تابع کمکی برای ساخت پست
const buildPost = (overrides: any = {}) => ({
    id: 'post-1',
    text: 'سلام دنیا',
    createdAt: new Date(ISO_DATE),
    updatedAt: new Date(ISO_DATE_UPDATED),
    user: { id: 'u1' },
    ...overrides,
});

// ✅ تابع کمکی برای ساخت کامنت
const buildComment = (overrides: any = {}) => ({
    id: 'c1',
    text: 'یک کامنت',
    createdAt: new Date(ISO_DATE),
    updatedAt: new Date(ISO_DATE_UPDATED),
    user: { id: 'u1' },
    ...overrides,
});

beforeEach(() => {
    jest.clearAllMocks();
});

// ===================================================================
// formatPost
// ===================================================================
describe('formatPost', () => {
    test('پستی بدون likes/comments را با مقادیر پیش‌فرض صفر فرمت می‌کند', () => {
        const post = buildPost();

        const result = formatPost(post);

        expect(result.likesCount).toBe(0);
        expect(result.commentsCount).toBe(0);
        expect(result.isLiked).toBe(false);
        expect(result.comments).toEqual([]);
        expect(result.user).toEqual({ mapped: true, sourceId: 'u1' });
        expect(mockedMapUser).toHaveBeenCalledWith(post.user);
    });

    test('فیلدهای اصلی پست را حفظ می‌کند (spread)', () => {
        const post = buildPost({ id: 'post-1', text: 'متن پست' });

        const result = formatPost(post);

        expect(result.id).toBe('post-1');
        expect(result.text).toBe('متن پست');
    });

    // ✅ تست جدید: تبدیل createdAt و updatedAt به ISO
    test('createdAt و updatedAt را به رشته ISO تبدیل می‌کند', () => {
        const post = buildPost();

        const result = formatPost(post);

        expect(result.createdAt).toBe(ISO_DATE);
        expect(result.updatedAt).toBe(ISO_DATE_UPDATED);
        expect(typeof result.createdAt).toBe('string');
        expect(typeof result.updatedAt).toBe('string');
    });

    test('likesCount و commentsCount را طبق طول آرایه‌ها محاسبه می‌کند', () => {
        const post = buildPost({
            likes: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
            comments: [
                buildComment({ id: 'c1' }),
                buildComment({ id: 'c2' }),
            ],
        });

        const result = formatPost(post);

        expect(result.likesCount).toBe(3);
        expect(result.commentsCount).toBe(2);
    });

    test('اگر userId در بین لایک‌ها باشد، isLiked برابر true است', () => {
        const post = buildPost({
            likes: [{ userId: 'x' }, { userId: 'y' }],
        });

        const result = formatPost(post, 'y');

        expect(result.isLiked).toBe(true);
    });

    test('اگر userId در بین لایک‌ها نباشد، isLiked برابر false است', () => {
        const post = buildPost({
            likes: [{ userId: 'x' }, { userId: 'y' }],
        });

        const result = formatPost(post, 'z');

        expect(result.isLiked).toBe(false);
    });

    test('اگر userId ارسال نشود، isLiked همیشه false است حتی اگر لایک وجود داشته باشد', () => {
        const post = buildPost({
            likes: [{ userId: 'x' }],
        });

        const result = formatPost(post);

        expect(result.isLiked).toBe(false);
    });

    test('هر کامنت را با formatComment فرمت می‌کند و userId را عبور می‌دهد', () => {
        const post = buildPost({
            comments: [
                buildComment({ id: 'c1', user: { id: 'cu1' }, likes: [{ userId: 'me' }] }),
                buildComment({ id: 'c2', user: { id: 'cu2' }, likes: [] }),
            ],
        });

        const result = formatPost(post, 'me');

        expect(result.comments).toHaveLength(2);
        expect(result.comments[0]).toMatchObject({ id: 'c1', likesCount: 1, isLiked: true });
        expect(result.comments[1]).toMatchObject({ id: 'c2', likesCount: 0, isLiked: false });
    });

    test('likes یا comments برابر null هم به آرایه خالی تبدیل می‌شود', () => {
        const post = buildPost({ likes: null, comments: null });

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
        const comment = buildComment();

        const result = formatComment(comment);

        expect(result.likesCount).toBe(0);
        expect(result.isLiked).toBe(false);
        expect(result.replies).toEqual([]);
        expect(result.user).toEqual({ mapped: true, sourceId: 'u1' });
    });

    test('فیلدهای اصلی کامنت را حفظ می‌کند (spread)', () => {
        const comment = buildComment({ id: 'c1', text: 'متن کامنت' });

        const result = formatComment(comment);

        expect(result.id).toBe('c1');
        expect(result.text).toBe('متن کامنت');
    });

    // ✅ تست جدید: تبدیل createdAt و updatedAt به ISO
    test('createdAt و updatedAt را به رشته ISO تبدیل می‌کند', () => {
        const comment = buildComment();

        const result = formatComment(comment);

        expect(result.createdAt).toBe(ISO_DATE);
        expect(result.updatedAt).toBe(ISO_DATE_UPDATED);
    });

    test('likesCount را طبق طول آرایه likes محاسبه می‌کند', () => {
        const comment = buildComment({
            likes: [{ userId: 'a' }, { userId: 'b' }],
        });

        const result = formatComment(comment);

        expect(result.likesCount).toBe(2);
    });

    test('اگر userId در بین لایک‌های کامنت باشد، isLiked برابر true است', () => {
        const comment = buildComment({
            likes: [{ userId: 'me' }],
        });

        const result = formatComment(comment, 'me');

        expect(result.isLiked).toBe(true);
    });

    test('اگر userId ارسال نشود، isLiked همیشه false است', () => {
        const comment = buildComment({
            likes: [{ userId: 'me' }],
        });

        const result = formatComment(comment);

        expect(result.isLiked).toBe(false);
    });

    test('replies را به‌صورت بازگشتی با formatComment فرمت می‌کند', () => {
        const comment = buildComment({
            replies: [
                buildComment({ id: 'r1', user: {}, likes: [{ userId: 'me' }] }),
                buildComment({ id: 'r2', user: {}, likes: [] }),
            ],
        });

        const result = formatComment(comment, 'me');

        expect(result.replies).toHaveLength(2);
        expect(result.replies[0]).toMatchObject({ id: 'r1', likesCount: 1, isLiked: true });
        expect(result.replies[1]).toMatchObject({ id: 'r2', likesCount: 0, isLiked: false });
    });

    test('بازگشت چند سطحی (reply داخل reply) را درست فرمت می‌کند', () => {
        const comment = buildComment({
            replies: [
                buildComment({
                    id: 'r1',
                    user: {},
                    replies: [
                        buildComment({ id: 'r1-1', user: {}, likes: [{ userId: 'me' }] }),
                    ],
                }),
            ],
        });

        const result = formatComment(comment, 'me');

        expect(result.replies[0].replies).toHaveLength(1);
        expect(result.replies[0].replies[0]).toMatchObject({ id: 'r1-1', isLiked: true });
    });

    test('likes یا replies برابر null هم به آرایه خالی تبدیل می‌شود', () => {
        const comment = buildComment({ likes: null, replies: null });

        const result = formatComment(comment);

        expect(result.likesCount).toBe(0);
        expect(result.replies).toEqual([]);
    });
});