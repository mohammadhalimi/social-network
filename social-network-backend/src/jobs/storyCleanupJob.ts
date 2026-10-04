// src/jobs/storyCleanupJob.ts
import cron from 'node-cron';
import { cleanupExpiredStories } from '../services/story-cleanup.service';

export function startStoryCleanupJob(): void {
    // ✅ یک بار فوری هنگام استارت سرور (برای پوشش دادن زمانی که سرور خاموش بوده)
    cleanupExpiredStories().catch((err) => {
        console.error('❌ خطا در اجرای اولیه‌ی پاک‌سازی استوری:', err);
    });
    // ✅ سپس هر ساعت یک‌بار تکرار می‌شود
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ اجرای job پاک‌سازی استوری‌های منقضی...');
        await cleanupExpiredStories();
    });

    console.log('🕐 Job پاک‌سازی استوری هر ساعت فعال است.');
}