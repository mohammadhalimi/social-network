// helpers/requireAuth.ts
// جلوگیری از تکرار «اگر کاربر لاگین نبود...» در هر resolver

export function requireAuth(
    context: any,
    message: string = 'برای ادامه باید وارد شوید.'
): string {
    if (!context.user || !context.user.userId) {
        throw new Error(message);
    }
    return context.user.userId;
}