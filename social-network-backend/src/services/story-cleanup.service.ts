// src/services/story-cleanup.service.ts
import prisma from '../lib/prisma';
import { deleteStoryMedia } from './story-media.service';

/**
 * پاک کردن استوری‌های منقضی‌شده از دیتابیس و دیسک
 */
export async function cleanupExpiredStories(): Promise<void> {
    try {
        const expiredStories = await prisma.story.findMany({
            where: {
                expiresAt: { lt: new Date() },
            },
            select: {
                id: true,
                mediaUrl: true,
            },
        });

        if (expiredStories.length === 0) {
            console.log('✅ هیچ استوری منقضی‌شده‌ای برای پاک‌سازی وجود ندارد.');
            return;
        }

        console.log(`🔍 ${expiredStories.length} استوری منقضی‌شده پیدا شد. در حال پاک‌سازی...`);

        // ✅ حذف فایل‌های فیزیکی با تابع آماده‌ی موجود
        for (const story of expiredStories) {
            deleteStoryMedia(story.mediaUrl);
        }

        // ✅ حذف رکوردهای دیتابیس (StoryView هم به‌خاطر onDelete: Cascade خودکار پاک می‌شه)
        const deleteResult = await prisma.story.deleteMany({
            where: {
                id: { in: expiredStories.map(s => s.id) },
            },
        });

        console.log(`✅ ${deleteResult.count} استوری منقضی‌شده پاک شد.`);
    } catch (error) {
        console.error('❌ خطا در پاک‌سازی استوری‌های منقضی‌شده:', error);
    }
}