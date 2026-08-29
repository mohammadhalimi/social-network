// resolvers/auth.resolvers.ts
// resolverهای مربوط به احراز هویت
import { mapUser } from '../helpers/mapUser';
import { AuthService } from '../../../modules/auth/auth.service';
import { successResponse, withTryCatch } from '../helpers/response';

const authService = new AuthService();

export const authResolvers = {
    register: withTryCatch(
        async (
            _: any,
            args: { email: string; username: string; password: string; fullName: string },
            context: any
        ) => {
            const result = await authService.register(
                args.email,
                args.username,
                args.password,
                args.fullName,
                context.res
            );
            return successResponse('ثبت‌نام با موفقیت انجام شد.', {
                user: mapUser(result.user),
                token: result.token,
            });
        },
        'خطا در ثبت‌نام',
        { user: null, token: null }
    ),

    login: withTryCatch(
        async (_: any, args: { email: string; password: string }, context: any) => {
            const result = await authService.login(args.email, args.password, context.res);
            return successResponse('ورود با موفقیت انجام شد.', {
                user: mapUser(result.user),
                token: result.token,
            });
        },
        'خطا در ورود',
        { user: null, token: null }
    ),

    logout: withTryCatch(
        async (_: any, __: any, context: any) => {
            await authService.logout(context.res);
            return successResponse('خروج با موفقیت انجام شد.');
        },
        'خطا در خروج از حساب'
    ),
    // ✅ Resolverهای جدید برای فراموشی رمز عبور
    requestPasswordReset: withTryCatch(
        async (_: any, { email }: { email: string }) => {
            await authService.requestPasswordReset(email);
            return successResponse('اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال شده است.');
        },
        'خطا در ارسال لینک بازیابی'
    ),

    resetPassword: withTryCatch(
        async (_: any, { token, newPassword }: { token: string; newPassword: string }) => {
            await authService.resetPassword(token, newPassword);
            return successResponse('رمز عبور با موفقیت تغییر یافت.');
        },
        'خطا در بازنشانی رمز عبور'
    ),
};