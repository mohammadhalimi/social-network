// components/story/CloseFriendsSelector/index.tsx
'use client';

import { Search, Loader2 } from 'lucide-react';
import { FollowerListItem } from './CloseFriendsSelector/FollowerListItem';
import { useFollowersPagination } from './CloseFriendsSelector/useFollowersPagination';
import { useCloseFriendsSelection } from './CloseFriendsSelector/useCloseFriendsSelection';

interface CloseFriendsSelectorProps {
    userId: string;
    onChange?: (selectedCount: number) => void;
}

export const CloseFriendsSelector = ({ userId, onChange }: CloseFriendsSelectorProps) => {
    const {
        searchTerm,
        setSearchTerm,
        allFollowers,
        loading,
        hasMore,
        loadingMore,
        loadMoreRef,
    } = useFollowersPagination(userId);

    const { selectedIds, toggle, save, isSaving } = useCloseFriendsSelection(onChange);

    return (
        <div
            className="
            border
            border-border
            rounded-xl
            p-4
            bg-card/50
        ">
            <div
                className="
                flex
                items-center
                justify-between
                mb-3
            ">
                <h1
                    className="
                    text-sm
                    font-bold
                    text-primary
                ">
                    انتخاب دوستان نزدیک ({selectedIds.size} نفر)
                </h1>
                <button
                    onClick={save}
                    disabled={isSaving}
                    className="
                    text-xs
                    px-3
                    py-1
                    bg-primary
                    text-white
                    rounded-lg
                    hover:bg-secondary
                    disabled:opacity-50
                    ">
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
            </div>

            <div
                className="
                relative
                mb-3
            ">
                <Search
                    className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-secondary
                "/>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در دنبال‌کنندگان..."
                    className="
                    w-full
                    pr-10
                    pl-3
                    py-2
                    bg-transparent
                    border
                    border-border
                    rounded-lg
                    text-sm
                    text-primary
                    placeholder:text-secondary
                    focus:border-primary
                    outline-none
                    "/>
            </div>

            <div
                className="
                max-h-60
                overflow-y-auto
                space-y-2
            ">
                {loading && allFollowers.length === 0 ? (
                    <div
                        className="
                        flex
                        justify-center
                        py-6
                    ">
                        <Loader2
                            size={20}
                            className="
                            animate-spin
                            text-primary
                        "/>
                    </div>
                ) : allFollowers.length === 0 ? (
                    <p
                        className="
                        text-center
                        text-xs
                        text-secondary
                        py-6
                    ">
                        {searchTerm ? 'کاربری پیدا نشد' : 'هنوز کسی شما را دنبال نکرده'}
                    </p>
                ) : (
                    <>
                        {allFollowers.map((follower: any) => (
                            <FollowerListItem
                                key={follower.id}
                                follower={follower}
                                isSelected={selectedIds.has(follower.id)}
                                onToggle={toggle}
                            />
                        ))}

                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                className="
                                flex
                                justify-center
                                py-3
                            ">
                                {loadingMore &&
                                    <Loader2
                                        size={18}
                                        className="
                                        animate-spin
                                        text-primary
                                "/>
                                }
                            </div>
                        )}

                        {!hasMore && allFollowers.length > 0 && (
                            <p
                                className="
                                text-center
                                text-[10px]
                                text-secondary
                                py-2
                            ">
                                همه فالوورها نمایش داده شدند
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};