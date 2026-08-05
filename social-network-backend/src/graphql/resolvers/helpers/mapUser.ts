// helpers/mapUser.ts
// تبدیل رکورد کاربر (Prisma) به شکل خروجی GraphQL
 
export function mapUser(user: {
    id: string | number;
    email: string;
    username: string;
    fullName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
 