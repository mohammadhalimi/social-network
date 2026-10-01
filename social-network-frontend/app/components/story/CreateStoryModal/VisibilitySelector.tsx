// components/story/CreateStoryModal/VisibilitySelector.tsx
'use client';

import { StoryVisibility } from '@/app/graphql/story.queries';

const VISIBILITY_OPTIONS: { value: StoryVisibility; label: string }[] = [
    { value: 'PUBLIC', label: 'همه' },
    { value: 'FOLLOWERS', label: 'دنبال‌کنندگان' },
    { value: 'CLOSE_FRIENDS', label: 'دوستان نزدیک' },
];

interface VisibilitySelectorProps {
    value: StoryVisibility;
    onChange: (value: StoryVisibility) => void;
}

export const VisibilitySelector = ({ value, onChange }: VisibilitySelectorProps) => (
    <div
        className="
        mb-4
    ">
        <label
            className="
            block
            text-sm
            font-medium
            text-primary
            mb-2
        ">
            چه کسانی ببینند؟
        </label>
        <div
            className="
            flex
            flex-wrap
            gap-2
        ">
            {VISIBILITY_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
                        px-3
                        py-1.5
                        rounded-lg
                        text-sm
                        transition-colors ${value === opt.value
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);