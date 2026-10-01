// components/story/CreateStoryModal/DurationSelector.tsx
'use client';

import { StoryDuration } from '@/app/graphql/story.queries';

const DURATION_OPTIONS: { value: StoryDuration; label: string }[] = [
    { value: 'SIX_HOURS', label: '۶ ساعت' },
    { value: 'TWELVE_HOURS', label: '۱۲ ساعت' },
    { value: 'EIGHTEEN_HOURS', label: '۱۸ ساعت' },
    { value: 'TWENTY_FOUR_HOURS', label: '۲۴ ساعت' },
];

interface DurationSelectorProps {
    value: StoryDuration;
    onChange: (value: StoryDuration) => void;
}

export const DurationSelector = ({ value, onChange }: DurationSelectorProps) => (
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
            مدت نمایش
        </label>
        <div
            className="
            flex
            flex-wrap
            gap-2
        ">
            {DURATION_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
                        px-3
                        py-1.5
                        rounded-lg
                        text-sm
                        transition-colors
                        ${value === opt.value
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