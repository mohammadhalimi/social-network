'use client';

import toast from 'react-hot-toast';
import { PostItem } from './PostItem';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_USER_POSTS, DELETE_POST } from '@/app/graphql/post.queries';
import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

interface PostListProps {
  userId: string;
  onEdit: (post: any) => void;
  onView: (post: any) => void;
  refreshTrigger?: number;
  updatedPost?: any;
}

export const PostList = ({ userId, onEdit, onView, refreshTrigger, updatedPost, }: PostListProps) => {
  const [limit] = useState(6);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    refetch,
    fetchMore,
  } = useQuery(GET_USER_POSTS, {
    variables: {
      userId,
      limit,
      offset: 0,
    },
    fetchPolicy: 'network-only',
    skip: !userId,
  });
  useEffect(() => {
    if (!updatedPost) return;

    setAllPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id
          ? updatedPost
          : post
      )
    );
  }, [updatedPost]);
  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  const isFetchingMoreRef = useRef(false);
  const dedupe = (posts: any[]) => {
    const seen = new Set();
    return posts.filter(p => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  };
  useEffect(() => {
    if (data?.getUserPosts) {
      setAllPosts(dedupe(data.getUserPosts)); // 👈 اینجا dedupe اضافه شد
      setHasMore(data.getUserPosts.length === limit);
      setIsLoading(false);
    }
  }, [data, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || isLoading) return;

    setLoadingMore(true);
    isFetchingMoreRef.current = true;
    try {
      const newOffset = allPosts.length;
      const { data: newData } = await fetchMore({ variables: { offset: newOffset } });

      if (newData?.getUserPosts) {
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = newData.getUserPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
        if (newData.getUserPosts.length < limit) setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      toast.error('خطا در بارگذاری پست‌های بیشتر');
    } finally {
      setLoadingMore(false);
      isFetchingMoreRef.current = false;
    }
  }, [fetchMore, hasMore, isLoading, loadingMore, allPosts.length, limit]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore, isLoading, loadingMore]);

const [deletePost] = useMutation(DELETE_POST);

  const handleDelete = async (postId: string) => {
    // نگه داشتن نسخه‌ی قبلی برای بازگردانی در صورت خطا
    const previousPosts = allPosts;

    // ✅ حذف خوش‌بینانه از UI (Optimistic update)
    setAllPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const { data } = await deletePost({ variables: { postId } });

      if (data?.deletePost?.success) {
        toast.success('پست حذف شد');
      } else {
        // اگه بک‌اند success:false برگردوند، برگردون به حالت قبل
        setAllPosts(previousPosts);
        toast.error(data?.deletePost?.message || 'خطا در حذف پست');
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      // ✅ در صورت خطا، پست رو به لیست برگردون
      setAllPosts(previousPosts);
      toast.error(error.message || 'خطا در حذف پست');
    }
  };

  if (isLoading && allPosts.length === 0) {
    return (
      <div
        className="
        flex
        items-center
        justify-center
        py-12
      ">
        <Loader2
          className="
          w-8
          h-8
          text-primary
          animate-spin
        "/>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        text-center
        py-12
      ">
        <p
          className="
          text-red-500
        ">خطا در دریافت پست‌ها
        </p>
        <p
          className="
          text-sm
          text-secondary
        ">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="
          mt-4
          px-4
          py-2
          bg-primary
          text-white
          rounded-lg
          hover:bg-primary-dark
          ">
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div
        className="
        text-center
        py-12
        text-secondary
      ">
        <p
          className="
          text-lg
        ">هنوز پستی منتشر نشده است
        </p>
        <p
          className="
          text-sm
          mt-2
        ">اولین پست خود را بنویسید!
        </p>
      </div>
    );
  }

  return (
    <div
      className="
      space-y-6
    ">
      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-4
      ">
        {allPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            onDelete={handleDelete}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="
          flex
          justify-center
          py-4
        ">
          {loadingMore
            &&
            <Loader2
              className="
              w-6
              h-6
              text-primary
              animate-spin
          "/>
          }
        </div>
      )}

      {!hasMore && allPosts.length > 0 && (
        <div
          className="
          text-center
          py-4
          text-secondary
          text-sm
        ">
          همه پست‌ها نمایش داده شدند ✅
        </div>
      )}
    </div>
  );
};