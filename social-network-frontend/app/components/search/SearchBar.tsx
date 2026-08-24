'use client';

import { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { SEARCH_USERS, SearchUsersResponse, SearchUsersVariables } from '@/app/graphql/user.queries';
import { AnimatePresence } from 'framer-motion';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';

// ✅ تعریف SearchResult
interface SearchResult {
  id: string;
  username: string;
  fullName: string;
  bio: string | null;
  avatar: string | null;
}

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchUsers, { loading, data, fetchMore }] = useLazyQuery<
    SearchUsersResponse,
    SearchUsersVariables
  >(SEARCH_USERS, {
    fetchPolicy: 'network-only',
  });

  // ✅ Debounce: 300 میلی‌ثانیه بعد از توقف تایپ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers({ variables: { searchTerm, limit: 10, offset: 0 } });
        setOffset(0);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  // ✅ به‌روزرسانی نتایج
  useEffect(() => {
    if (data?.searchUsers) {
      setResults(data.searchUsers.users);
      setHasMore(data.searchUsers.hasMore ?? false);
    }
  }, [data]);

  // ✅ بستن نتایج با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ بارگذاری بیشتر
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const newOffset = offset + 10;

    try {
      const result = await fetchMore({
        variables: { searchTerm, limit: 10, offset: newOffset },
      });

      const searchUsersData = result.data?.searchUsers;

      if (searchUsersData) {
        setResults((prev) => [...prev, ...searchUsersData.users]);
        setHasMore(searchUsersData.hasMore ?? false);
        setOffset(newOffset);
      }
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/uploads/')) return `http://localhost:4000${avatar}`;
    return `http://localhost:4000/uploads/${avatar}`;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
        onClear={clearSearch}
        inputRef={inputRef}
      />

      <AnimatePresence>
        {isOpen && (searchTerm.length >= 2 || results.length > 0) && (
          <SearchResults
            results={results}
            loading={loading}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            searchTerm={searchTerm}
            onLoadMore={loadMore}
            onClose={() => setIsOpen(false)}
            getAvatarUrl={getAvatarUrl}
          />
        )}
      </AnimatePresence>
    </div>
  );
};