// app/lib/formatDate.ts

/**
 * تبدیل تاریخ به فرمت فارسی و خوانا
 * در صورت نامعتبر بودن یا خالی بودن مقدار، متن جایگزین برمی‌گرداند
 */
export const formatPersianDate = (dateValue: string | number | Date | null | undefined): string => {
    if (!dateValue) return 'تاریخ نامشخص';

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return 'تاریخ نامشخص';
    }

    return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};