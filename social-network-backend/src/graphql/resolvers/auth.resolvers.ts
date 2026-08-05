// resolvers/auth.resolvers.ts
// resolverهای مربوط به احراز هویت

import { AuthService } from '../../modules/auth/auth.service';
import { mapUser } from './helpers/mapUser';
import { successResponse, withTryCatch } from './helpers/response';

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
};