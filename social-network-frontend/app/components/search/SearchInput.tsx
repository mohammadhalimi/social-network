'use client';

import { RefObject } from 'react';
import {
    Search,
    X
} from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    onClear: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

export const SearchInput = ({
    value,
    onChange,
    onFocus,
    onClear,
    inputRef,
}: SearchInputProps) => (
    <div className="relative">
        <Search
            className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            w-5
            h-5
            text-secondary
    "/>
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder="جستجوی کاربران..."
            className="
            input-light
            w-full
            pr-10
            pl-10
      "/>
        {value && (
            <button
                onClick={onClear}
                className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-secondary
                hover:text-primary
                transition-colors
                ">
                <X className="
                w-5
                h-5
                "/>
            </button>
        )}
    </div>
);