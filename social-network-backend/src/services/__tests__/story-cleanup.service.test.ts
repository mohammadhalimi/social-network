// src/services/__tests__/story-cleanup.service.test.ts

// ✅ ماک کردن prisma
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        story: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

// ✅ ماک کردن story-media.service
jest.mock('../story-media.service', () => ({
    deleteStoryMedia: jest.fn(),
}));

import prisma from '../../lib/prisma';
import { deleteStoryMedia } from '../story-media.service';
import { cleanupExpiredStories } from '../story-cleanup.service';

const mockedFindMany = (prisma as any).story.findMany as jest.Mock;
const mockedDeleteMany = (prisma as any).story.deleteMany as jest.Mock;
const mockedDeleteStoryMedia = deleteStoryMedia as jest.Mock;

describe('story-cleanup.service', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // ✅ جلوگیری از شلوغ شدن کنسول تست
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    // ==========================================================
    //  حالت ۱: هیچ استوری منقضی‌شده‌ای وجود ندارد
    // ==========================================================
    it('1. اگر هیچ استوری منقضی‌شده‌ای نباشد، فقط لاگ می‌کند و چیزی حذف نمی‌کند', async () => {
        mockedFindMany.mockResolvedValue([]);

        await cleanupExpiredStories();

        expect(mockedFindMany).toHaveBeenCalledWith({
            where: { expiresAt: { lt: expect.any(Date) } },
            select: { id: true, mediaUrl: true },
        });
        expect(mockedDeleteStoryMedia).not.toHaveBeenCalled();
        expect(mockedDeleteMany).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۲: استوری‌های منقضی‌شده وجود دارند
    // ==========================================================
    it('2. اگر استوری منقضی‌شده وجود داشته باشد، فایل و رکورد آن‌ها را حذف می‌کند', async () => {
        const expiredStories = [
            { id: 'story-1', mediaUrl: 'http://localhost:4000/uploads/stories/a.jpg' },
            { id: 'story-2', mediaUrl: 'http://localhost:4000/uploads/stories/b.mp4' },
            { id: 'story-3', mediaUrl: 'http://localhost:4000/uploads/stories/c.png' },
        ];
        mockedFindMany.mockResolvedValue(expiredStories);
        mockedDeleteMany.mockResolvedValue({ count: 3 });

        await cleanupExpiredStories();

        // ✅ حذف فایل‌های فیزیکی
        expect(mockedDeleteStoryMedia).toHaveBeenCalledTimes(3);
        expect(mockedDeleteStoryMedia).toHaveBeenNthCalledWith(1, expiredStories[0].mediaUrl);
        expect(mockedDeleteStoryMedia).toHaveBeenNthCalledWith(2, expiredStories[1].mediaUrl);
        expect(mockedDeleteStoryMedia).toHaveBeenNthCalledWith(3, expiredStories[2].mediaUrl);

        // ✅ حذف رکوردهای دیتابیس
        expect(mockedDeleteMany).toHaveBeenCalledWith({
            where: {
                id: { in: ['story-1', 'story-2', 'story-3'] },
            },
        });
    });

    // ==========================================================
    //  حالت ۳: فیلتر expiresAt صحیح است
    // ==========================================================
    it('3. فقط استوری‌های منقضی‌شده (expiresAt < اکنون) را می‌خواند', async () => {
        mockedFindMany.mockResolvedValue([]);

        const beforeCall = new Date();
        await cleanupExpiredStories();
        const afterCall = new Date();

        const calledWith = mockedFindMany.mock.calls[0][0];
        const passedDate = calledWith.where.expiresAt.lt as Date;

        // ✅ تاریخ باید بین زمان قبل و بعد فراخوانی باشد
        expect(passedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(passedDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    // ==========================================================
    //  حالت ۴: فقط id و mediaUrl از دیتابیس خوانده می‌شوند
    // ==========================================================
    it('4. فقط فیلدهای id و mediaUrl را از دیتابیس می‌خواند', async () => {
        mockedFindMany.mockResolvedValue([]);

        await cleanupExpiredStories();

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                select: { id: true, mediaUrl: true },
            })
        );
    });

    // ==========================================================
    //  حالت ۵: خطا در خواندن از دیتابیس
    // ==========================================================
    it('5. اگر خواندن از دیتابیس خطا بدهد، برنامه کرش نمی‌کند و خطا لاگ می‌شود', async () => {
        mockedFindMany.mockRejectedValue(new Error('DB connection failed'));

        await expect(cleanupExpiredStories()).resolves.not.toThrow();

        expect(mockedDeleteStoryMedia).not.toHaveBeenCalled();
        expect(mockedDeleteMany).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '❌ خطا در پاک‌سازی استوری‌های منقضی‌شده:',
            expect.any(Error)
        );
    });

    // ==========================================================
    //  حالت ۶: خطا در حذف رکوردهای دیتابیس
    // ==========================================================
    it('6. اگر حذف از دیتابیس خطا بدهد، برنامه کرش نمی‌کند و خطا لاگ می‌شود', async () => {
        mockedFindMany.mockResolvedValue([
            { id: 'story-1', mediaUrl: 'http://localhost:4000/uploads/stories/a.jpg' },
        ]);
        mockedDeleteMany.mockRejectedValue(new Error('Delete failed'));

        await expect(cleanupExpiredStories()).resolves.not.toThrow();

        // ✅ فایل‌ها قبل از خطا حذف شده‌اند
        expect(mockedDeleteStoryMedia).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۷: اگر یک استوری mediaUrl خالی داشته باشد
    // ==========================================================
    it('7. اگر mediaUrl یک استوری null باشد، deleteStoryMedia با null صدا زده می‌شود', async () => {
        mockedFindMany.mockResolvedValue([
            { id: 'story-1', mediaUrl: null },
            { id: 'story-2', mediaUrl: 'http://localhost:4000/uploads/stories/b.jpg' },
        ]);
        mockedDeleteMany.mockResolvedValue({ count: 2 });

        await cleanupExpiredStories();

        expect(mockedDeleteStoryMedia).toHaveBeenCalledTimes(2);
        expect(mockedDeleteStoryMedia).toHaveBeenNthCalledWith(1, null);
        expect(mockedDeleteStoryMedia).toHaveBeenNthCalledWith(2, 'http://localhost:4000/uploads/stories/b.jpg');
    });

    // ==========================================================
    //  حالت ۸: حذف گروهی با id های درست انجام می‌شود
    // ==========================================================
    it('8. فقط id استوری‌های پیدا شده را در deleteMany پاس می‌دهد', async () => {
        mockedFindMany.mockResolvedValue([
            { id: 'story-A', mediaUrl: 'a.jpg' },
            { id: 'story-B', mediaUrl: 'b.jpg' },
        ]);
        mockedDeleteMany.mockResolvedValue({ count: 2 });

        await cleanupExpiredStories();

        const deleteArgs = mockedDeleteMany.mock.calls[0][0];
        expect(deleteArgs.where.id.in).toEqual(['story-A', 'story-B']);
        expect(deleteArgs.where.id.in).toHaveLength(2);
    });
});