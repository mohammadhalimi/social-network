'use client';

import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
    return (
        <div
            className="
            relative
            mb-4
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="جستجو در لیست..."
                className="
                w-full
                pr-10
                pl-4
                py-2
                bg-transparent
                border
                border-border
                rounded-xl
                focus:border-primary
                outline-none
                text-sm
                text-primary"
            />
        </div>
    );
};