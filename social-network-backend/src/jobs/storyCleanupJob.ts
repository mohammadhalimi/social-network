// src/jobs/storyCleanupJob.ts
import cron from 'node-cron';
import { cleanupExpiredStories } from '../services/story-cleanup.service';

export function startStoryCleanupJob(): void {
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ اجرای job پاک‌سازی استوری‌های منقضی...');
        await cleanupExpiredStories();
    });

    console.log('🕐 Job پاک‌سازی استوری هر ساعت فعال است.');
}