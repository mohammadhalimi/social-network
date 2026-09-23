// resolvers/story/story.mutations.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';
import { canViewStory } from '../helpers/checkStoryAccess';
import { calculateExpiresAt } from '../helpers/storyDuration';

// ✅ مقادیر مجاز برای mediaType و visibility
const VALID_MEDIA_TYPES = ['image', 'video'] as const;
const VALID_VISIBILITIES = ['PUBLIC', 'FOLLOWERS', 'CLOSE_FRIENDS'] as const;
const VALID_DURATIONS = ['SIX_HOURS', 'TWELVE_HOURS', 'EIGHTEEN_HOURS', 'TWENTY_FOUR_HOURS'] as const;

export const storyMutations = {
    createStory: async (
        _: any,
        { mediaUrl, mediaType, duration, visibility }: {
            mediaUrl: string;
            mediaType: string;
            duration: string;
            visibility: string;
        },
        context: any
    ) => {
        const userId = requireAuth(context, 'برای ثبت استوری باید وارد شوید.');

        // ✅ اعتبارسنجی mediaType
        if (!VALID_MEDIA_TYPES.includes(mediaType as any)) {
            throw new Error('نوع فایل باید image یا video باشد.');
        }

        // ✅ اعتبارسنجی visibility
        if (!VALID_VISIBILITIES.includes(visibility as any)) {
            throw new Error('نوع دسترسی نامعتبر است.');
        }

        // ✅ اعتبارسنجی duration (اگرچه calculateExpiresAt خودش خطا می‌دهد، ولی برای پیام واضح‌تر)
        if (!VALID_DURATIONS.includes(duration as any)) {
            throw new Error('مدت زمان نامعتبر است.');
        }

        // ✅ اعتبارسنجی mediaUrl (خالی نبودن)
        if (!mediaUrl || !mediaUrl.trim()) {
            throw new Error('آدرس فایل نمی‌تواند خالی باشد.');
        }

        const expiresAt = calculateExpiresAt(duration);

        const story = await prisma.story.create({
            data: {
                userId,
                mediaUrl: mediaUrl.trim(),
                mediaType,
                visibility: visibility as any,
                expiresAt,
            },
            include: { user: true, views: true },
        });

        return {
            success: true,
            message: 'استوری با موفقیت منتشر شد.',
            story: {
                ...story,
                createdAt: story.createdAt.toISOString(),
                expiresAt: story.expiresAt.toISOString(),
                viewsCount: 0,
                isViewedByMe: false,
                viewers: [],
            },
        };
    },

    deleteStory: async (_: any, { storyId }: { storyId: string }, context: any) => {
        const userId = requireAuth(context, 'برای حذف استوری باید وارد شوید.');

        const story = await prisma.story.findUnique({ where: { id: storyId } });
        if (!story) throw new Error('استوری یافت نشد.');
        if (story.userId !== userId) throw new Error('شما اجازه‌ی حذف این استوری را ندارید.');

        await prisma.story.delete({ where: { id: storyId } });

        return { success: true, message: 'استوری حذف شد.' };
    },

    viewStory: async (_: any, { storyId }: { storyId: string }, context: any) => {
        const userId = requireAuth(context, 'برای مشاهده باید وارد شوید.');

        const story = await prisma.story.findUnique({ where: { id: storyId } });
        if (!story) throw new Error('استوری یافت نشد.');

        // ✅ چک انقضا
        if (story.expiresAt < new Date()) {
            throw new Error('این استوری منقضی شده است.');
        }

        // ✅ چک دسترسی
        const hasAccess = await canViewStory(userId, story);
        if (!hasAccess) {
            throw new Error('شما اجازه‌ی مشاهده‌ی این استوری را ندارید.');
        }

        // ✅ صاحب استوری نیازی به ثبت view برای خودش نداره
        if (story.userId !== userId) {
            await prisma.storyView.upsert({
                where: { storyId_viewerId: { storyId, viewerId: userId } },
                create: { storyId, viewerId: userId },
                update: {},
            });
        }

        return { success: true, message: 'مشاهده ثبت شد.' };
    },

    addCloseFriend: async (_: any, { userId: friendId }: { userId: string }, context: any) => {
        const ownerId = requireAuth(context, 'برای این کار باید وارد شوید.');

        if (ownerId === friendId) {
            throw new Error('نمی‌توانید خودتان را انتخاب کنید.');
        }

        // ✅ باید جزو فالوورهای خودم باشه
        const isFollower = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: friendId, followingId: ownerId } },
        });
        if (!isFollower) {
            throw new Error('فقط می‌توانید از بین دنبال‌کنندگان خود انتخاب کنید.');
        }

        await prisma.closeFriend.upsert({
            where: { ownerId_friendId: { ownerId, friendId } },
            create: { ownerId, friendId },
            update: {},
        });

        const closeFriends = await prisma.closeFriend.findMany({
            where: { ownerId },
            include: { friend: true },
        });

        return {
            success: true,
            message: 'به لیست دوستان نزدیک اضافه شد.',
            closeFriends: closeFriends.map(cf => cf.friend),
        };
    },

    removeCloseFriend: async (_: any, { userId: friendId }: { userId: string }, context: any) => {
        const ownerId = requireAuth(context, 'برای این کار باید وارد شوید.');

        await prisma.closeFriend.deleteMany({
            where: { ownerId, friendId },
        });

        const closeFriends = await prisma.closeFriend.findMany({
            where: { ownerId },
            include: { friend: true },
        });

        return {
            success: true,
            message: 'از لیست دوستان نزدیک حذف شد.',
            closeFriends: closeFriends.map(cf => cf.friend),
        };
    },
};