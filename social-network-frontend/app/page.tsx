'use client'

import { useState } from 'react'

// داده‌های نمونه برای نمایش پست‌ها (با تصاویر متفاوت)
const samplePosts = [
  {
    id: 1,
    user: {
      name: 'پریا احمدی',
      avatar: 'P',
    },
    image: 'https://picsum.photos/seed/1/400/400',
    likes: 42,
    comments: 12,
    isLiked: false,
  },
  {
    id: 2,
    user: {
      name: 'نیما کریمی',
      avatar: 'N',
    },
    image: 'https://picsum.photos/seed/2/400/400',
    likes: 87,
    comments: 24,
    isLiked: true,
  },
  {
    id: 3,
    user: {
      name: 'سارا محمدی',
      avatar: 'S',
    },
    image: 'https://picsum.photos/seed/3/400/400',
    likes: 31,
    comments: 8,
    isLiked: false,
  },
  {
    id: 4,
    user: {
      name: 'علی رضایی',
      avatar: 'ع',
    },
    image: 'https://picsum.photos/seed/4/400/400',
    likes: 65,
    comments: 18,
    isLiked: false,
  },
  {
    id: 5,
    user: {
      name: 'مریم حسینی',
      avatar: 'م',
    },
    image: 'https://picsum.photos/seed/5/400/400',
    likes: 53,
    comments: 9,
    isLiked: true,
  },
  {
    id: 6,
    user: {
      name: 'رضا کریمی',
      avatar: 'ر',
    },
    image: 'https://picsum.photos/seed/6/400/400',
    likes: 28,
    comments: 5,
    isLiked: false,
  },
]

export default function Home() {
  const [posts, setPosts] = useState(samplePosts)

  const handleLike = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* هدر (فیکس) - مثل اینستاگرام */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#dbdbdb] z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-[#262626]">شبکه اجتماعی</h1>
          <div className="flex items-center gap-2">
            <button className="text-sm text-[#262626] font-medium px-3 py-1.5 rounded-lg hover:bg-[#f2f2f2] transition">
              ورود
            </button>
            <button className="text-sm bg-[#0095f6] text-white font-medium px-4 py-1.5 rounded-lg hover:bg-[#1877f2] transition">
              ثبت‌نام
            </button>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="pt-20 pb-8 max-w-4xl mx-auto px-4">
        {/* ✅ گرید ۳ ستونه در دسکتاپ، ۲ ستونه در تبلت، ۱ ستونه در موبایل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <div key={post.id} className="relative group bg-white rounded-xl border border-[#dbdbdb] overflow-hidden hover:shadow-md transition-shadow">
              {/* تصویر پست (همیشه وجود داره) */}
              <div className="aspect-square bg-[#f2f2f2]">
                <img
                  src={post.image}
                  alt={`پست از ${post.user.name}`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* اطلاعات کاربر و تعاملات (اورلی روی عکس) */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                {/* هدر پست (کاربر) */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0095f6] flex items-center justify-center text-white font-bold text-xs">
                    {post.user.avatar}
                  </div>
                  <span className="text-white font-medium text-sm">{post.user.name}</span>
                </div>

                {/* دکمه‌های تعامل در پایین */}
                <div className="flex items-center gap-6 text-white">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition ${
                      post.isLiked ? 'text-red-500' : 'hover:text-red-400'
                    }`}
                  >
                    <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm hover:text-[#0095f6] transition">
                    <span className="text-xl">💬</span>
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}