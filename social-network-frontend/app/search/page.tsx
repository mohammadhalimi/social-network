'use client';

import { SearchBar } from '@/app/components/search/SearchBar';

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">جستجوی کاربران</h1>
      <div className="flex justify-center">
        <SearchBar />
      </div>
      <div className="mt-8 text-center text-text-secondary text-sm">
        با حداقل ۲ کاراکتر جستجو کنید
      </div>
    </div>
  );
}