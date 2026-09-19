'use client';

import { Send, Loader2 } from 'lucide-react';

interface CommentInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    isReply?: boolean;
}

export const CommentInput = ({
    value,
    onChange,
    onSubmit,
    isSubmitting,
    isReply = false,
}: CommentInputProps) => {
    return (
        <form
            onSubmit={onSubmit}
            className="
            flex
            items-end 
            gap-2
        ">
            <div
                className="
                flex-1
            ">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={isReply ? "پاسخ خود را بنویسید..." : "نظر خود را بنویسید..."}
                    rows={2}
                    disabled={isSubmitting}
                    className="
                    w-full
                    bg-transparent
                    border
                    border-border
                    rounded-xl
                    focus:border-primary
                    outline-none
                    p-2.5
                    text-sm
                    text-primary
                    placeholder:text-secondary
                    resize-none
                    disabled:opacity-60
                "
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting || !value.trim()}
                className="
                p-2.5
                bg-primary
                text-white
                rounded-xl
                hover:bg-primary-dark
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex-shrink-0
            "
            >
                {isSubmitting ? (
                    <Loader2
                        size={18}
                        className="animate-spin"
                    />
                ) : (
                    <Send
                        size={18}
                    />
                )}
            </button>
        </form>
    );
};