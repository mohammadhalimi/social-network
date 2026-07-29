import { UserService } from '../../modules/user/user.service';

const userService = new UserService();

export const userResolvers = {
    Mutation: {
        register: async (_: any, args: { email: string; username: string; password: string; fullName: string }) => {
            try {
                console.log('📝 شروع ثبت‌نام با:', args); // لاگ ورودی
                const result = await userService.register(
                    args.email,
                    args.username,
                    args.password,
                    args.fullName
                );
                console.log('✅ نتیجه:', result); // لاگ خروجی
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
                        createdAt: result.user.createdAt.toISOString(), // 👈 مهم
                        updatedAt: result.user.updatedAt.toISOString(), // 👈 مهم
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
    },
};