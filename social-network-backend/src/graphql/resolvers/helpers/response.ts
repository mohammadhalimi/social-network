// helpers/response.ts
// ساخت پاسخ‌های یکدست موفق/ناموفق + پوشش try/catch تکراری

type MutationResult = Record<string, any>;

export function successResponse(message: string, extra: MutationResult = {}) {
    return { success: true, message, ...extra };
}

export function errorResponse(message: string, extra: MutationResult = {}) {
    return { success: false, message, ...extra };
}

/**
 * یک resolver را با try/catch می‌پوشاند و در صورت خطا
 * یک پاسخ ناموفق استاندارد (با فیلدهای null شده‌ی extraNullFields) برمی‌گرداند.
 *
 * مثال:
 *   updateProfile: withTryCatch(
 *     async (_: any, args: any, context: any) => { ... },
 *     'خطا در به‌روزرسانی پروفایل',
 *     { user: null }
 *   )
 */
export function withTryCatch<T extends (...args: any[]) => Promise<MutationResult>>(
    resolver: T,
    fallbackMessage: string,
    extraNullFields: MutationResult = {}
) {
    return async (...args: Parameters<T>): Promise<MutationResult> => {
        try {
            return await resolver(...args);
        } catch (error: any) {
            return errorResponse(error.message || fallbackMessage, extraNullFields);
        }
    };
}