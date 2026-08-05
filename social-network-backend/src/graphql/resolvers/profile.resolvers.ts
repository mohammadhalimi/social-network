// resolvers/profile.resolvers.ts
// resolverهای مربوط به مدیریت پروفایل

import { ProfileService } from '../../modules/profile/profile.service';
import { mapUser } from './helpers/mapUser';
import { requireAuth } from './try-catch/requireAuth';
import { successResponse, withTryCatch } from './helpers/response';

const profileService = new ProfileService();

export const profileResolvers = {
    updateProfile: withTryCatch(
        async (_: any, args: any, context: any) => {
            const userId = requireAuth(context, 'برای ویرایش پروفایل باید وارد شوید.');

            const updatedUser = await profileService.updateProfile(userId, {
                username: args.username,
                fullName: args.fullName,
                email: args.email,
                bio: args.bio,
                avatar: args.avatar,
            });

            return successResponse('پروفایل با موفقیت به‌روزرسانی شد.', {
                user: mapUser(updatedUser),
            });
        },
        'خطا در به‌روزرسانی پروفایل',
        { user: null }
    ),

    changePassword: withTryCatch(
        async (_: any, args: any, context: any) => {
            const userId = requireAuth(context, 'برای تغییر رمز عبور باید وارد شوید.');

            const updatedUser = await profileService.changePassword(
                userId,
                args.oldPassword,
                args.newPassword
            );

            return successResponse('رمز عبور با موفقیت تغییر یافت.', {
                user: mapUser(updatedUser),
            });
        },
        'خطا در تغییر رمز عبور',
        { user: null }
    ),
};