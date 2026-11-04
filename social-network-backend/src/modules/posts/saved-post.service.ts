// src/modules/post/saved-post.service.ts
import prisma from "../../lib/prisma";

export class SavedPostService {
    async toggleSavePost(userId: string, postId: string) {
        // چک کردن وجود پست
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('پست یافت نشد.');

        // چک کردن اینکه آیا از قبل ذخیره شده یا نه
        const existing = await prisma.savedPost.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existing) {
            // اگر بود، پاکش کن
            await prisma.savedPost.delete({ where: { id: existing.id } });
            return { success: true, message: 'پست از ذخیره‌ها حذف شد.', isSaved: false };
        } else {
            // اگر نبود، ذخیره کن
            await prisma.savedPost.create({ data: { userId, postId } });
            return { success: true, message: 'پست ذخیره شد.', isSaved: true };
        }
    }

    async getSavedPosts(userId: string, limit: number = 20, offset: number = 0) {
        const posts = await prisma.post.findMany({
            where: { savedBy: { some: { userId } } }, // ✅ پست‌هایی که این کاربر ذخیره کرده
            include: {
                user: true,
                _count: { select: { likes: true, comments: true } },
                likes: { where: { userId } },
            },
            orderBy: { createdAt: 'desc' }, // یا بر اساس زمان ذخیره
            skip: offset,
            take: limit,
        });

        const totalCount = await prisma.savedPost.count({ where: { userId } });

        return {
            posts: posts.map(p => ({
                ...p,
                isLiked: p.likes.length > 0,
                isSaved: true
            })),
            totalCount,
            hasMore: offset + posts.length < totalCount,
        };
    }
}