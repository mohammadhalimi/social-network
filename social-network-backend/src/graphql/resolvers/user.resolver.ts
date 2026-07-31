import { UserService } from '../../modules/user/user.service';

const userService = new UserService();

export const userResolvers = {
    Mutation: {
        register: async (
            _: any,
            args: { email: string; username: string; password: string; fullName: string },
            context: any // 👈 اینجا جدا از args
        ) => {
            try {
                console.log('📝 شروع ثبت‌نام با:', args);
                const result = await userService.register(
                    args.email,
                    args.username,
                    args.password,
                    args.fullName,
                    context.res // 👈 اینجا هم اصلاح شد
                );
                console.log('✅ نتیجه:', result);
                return {
                    success: true,
                    message: 'ثبت‌نام با موفقیت انجام شد.',
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        username: result.user.username,
                        fullName: result.user.fullName,
                        bio: result.user.bio,
                        avatar: result.user.avatar,
                        createdAt: result.user.createdAt.toISOString(),
                        updatedAt: result.user.updatedAt.toISOString(),
                    },
                    token: result.token,
                };
            } catch (error: any) {
                console.error('❌ خطا در ثبت‌نام:', error);
                return {
                    success: false,
                    message: error.message,
                    user: null,
                    token: null,
                };
            }
        },

        login: async (
            _: any,
            args: { email: string; password: string },
            context: any // 👈 همینجوری اینجا هم
        ) => {
            try {
                const result = await userService.login(args.email, args.password, context.res);
                return {
                    success: true,
                    message: 'ورود با موفقیت انجام شد.',
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        username: result.user.username,
                        fullName: result.user.fullName,
                        bio: result.user.bio,
                        avatar: result.user.avatar,
                        createdAt: result.user.createdAt.toISOString(),
                        updatedAt: result.user.updatedAt.toISOString(),
                    },
                    token: result.token,
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message,
                    user: null,
                    token: null,
                };
            }
        },
    },
};