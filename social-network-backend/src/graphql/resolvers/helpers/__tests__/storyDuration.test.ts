// src/graphql/resolvers/helpers/__tests__/storyDuration.test.ts

import { durationToHours, calculateExpiresAt } from '../storyDuration';

describe('storyDuration', () => {
    // =====================================================
    //  durationToHours
    // =====================================================
    describe('durationToHours', () => {
        it('1. SIX_HOURS را به 6 تبدیل می‌کند', () => {
            expect(durationToHours('SIX_HOURS')).toBe(6);
        });

        it('2. TWELVE_HOURS را به 12 تبدیل می‌کند', () => {
            expect(durationToHours('TWELVE_HOURS')).toBe(12);
        });

        it('3. EIGHTEEN_HOURS را به 18 تبدیل می‌کند', () => {
            expect(durationToHours('EIGHTEEN_HOURS')).toBe(18);
        });

        it('4. TWENTY_FOUR_HOURS را به 24 تبدیل می‌کند', () => {
            expect(durationToHours('TWENTY_FOUR_HOURS')).toBe(24);
        });

        it('5. برای مقدار نامعتبر، خطا پرتاب می‌کند', () => {
            expect(() => durationToHours('INVALID')).toThrow('مدت زمان نامعتبر است.');
            expect(() => durationToHours('')).toThrow('مدت زمان نامعتبر است.');
            expect(() => durationToHours('six_hours')).toThrow('مدت زمان نامعتبر است.');
        });
    });

    // =====================================================
    //  calculateExpiresAt
    // =====================================================
    describe('calculateExpiresAt', () => {
        it('1. برای SIX_HOURS، تاریخ ۶ ساعت بعد را برمی‌گرداند', () => {
            const before = Date.now();
            const result = calculateExpiresAt('SIX_HOURS');
            const after = Date.now();

            const sixHoursInMs = 6 * 60 * 60 * 1000;

            // ✅ اختلاف باید حدود ۶ ساعت باشد
            expect(result.getTime()).toBeGreaterThanOrEqual(before + sixHoursInMs);
            expect(result.getTime()).toBeLessThanOrEqual(after + sixHoursInMs);
        });

        it('2. برای TWELVE_HOURS، تاریخ ۱۲ ساعت بعد را برمی‌گرداند', () => {
            const before = Date.now();
            const result = calculateExpiresAt('TWELVE_HOURS');
            const after = Date.now();

            const twelveHoursInMs = 12 * 60 * 60 * 1000;

            expect(result.getTime()).toBeGreaterThanOrEqual(before + twelveHoursInMs);
            expect(result.getTime()).toBeLessThanOrEqual(after + twelveHoursInMs);
        });

        it('3. برای EIGHTEEN_HOURS، تاریخ ۱۸ ساعت بعد را برمی‌گرداند', () => {
            const before = Date.now();
            const result = calculateExpiresAt('EIGHTEEN_HOURS');
            const after = Date.now();

            const eighteenHoursInMs = 18 * 60 * 60 * 1000;

            expect(result.getTime()).toBeGreaterThanOrEqual(before + eighteenHoursInMs);
            expect(result.getTime()).toBeLessThanOrEqual(after + eighteenHoursInMs);
        });

        it('4. برای TWENTY_FOUR_HOURS، تاریخ ۲۴ ساعت بعد را برمی‌گرداند', () => {
            const before = Date.now();
            const result = calculateExpiresAt('TWENTY_FOUR_HOURS');
            const after = Date.now();

            const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

            expect(result.getTime()).toBeGreaterThanOrEqual(before + twentyFourHoursInMs);
            expect(result.getTime()).toBeLessThanOrEqual(after + twentyFourHoursInMs);
        });

        it('5. یک Date معتبر برمی‌گرداند', () => {
            const result = calculateExpiresAt('SIX_HOURS');

            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).not.toBeNaN();
        });

        it('6. برای مقدار نامعتبر، خطا پرتاب می‌کند', () => {
            expect(() => calculateExpiresAt('INVALID')).toThrow('مدت زمان نامعتبر است.');
        });
    });
});