'use client';

import { motion } from 'framer-motion';
import { SearchEmpty } from './SearchEmpty';
import { SearchLoading } from './SearchLoading';
import { LoadMoreButton } from './LoadMoreButton';
import { SearchResultItem } from './SearchResultItem';

interface SearchResult {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    avatar: string | null;
}

interface SearchResultsProps {
    results: SearchResult[];
    loading: boolean;
    hasMore: boolean;
    isLoadingMore: boolean;
    searchTerm: string;
    onLoadMore: () => void;
    onClose: () => void;
    getAvatarUrl: (avatar: string | null) => string | null;
}

export const SearchResults = ({
    results,
    loading,
    hasMore,
    isLoadingMore,
    searchTerm,
    onLoadMore,
    onClose,
    getAvatarUrl,
}: SearchResultsProps) => {
    const showLoading = loading && searchTerm.length >= 2 && results.length === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
            absolute
            top-full
            mt-2
            w-full
            bg-card
            border
            border-border
            rounded-2xl
            shadow-soft
            p-2
            max-h-96
            overflow-y-auto
            z-50
      ">
            {showLoading ? (
                <SearchLoading />
            ) : results.length > 0 ? (
                <>
                    {results.map((user) => (
                        <SearchResultItem
                            key={user.id}
                            id={user.id}
                            username={user.username}
                            fullName={user.fullName}
                            avatar={user.avatar}
                            onClick={onClose}
                            getAvatarUrl={getAvatarUrl}
                        />
                    ))}

                    {hasMore && (
                        <LoadMoreButton onClick={onLoadMore} isLoading={isLoadingMore} />
                    )}
                </>
            ) : (
                <SearchEmpty />
            )}
        </motion.div>
    );
};