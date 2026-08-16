'use client';

import {
ReactNode,
KeyboardEvent  
} from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    optional?: boolean;
    children: ReactNode;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const FormField = ({
    label,
    error,
    optional,
    children,
    onKeyDown,
}: FormFieldProps) => (
    <div>
        <div
            className="
            flex
            items-center
            justify-between
            mb-1.5
            ">
            <label
                className="
                block
                text-sm
                font-medium
                text-primary
                ">
                {label}
            </label>
            {optional && (
                <span
                    className="
                    text-xs
                    text-secondary
                    ">اختیاری
                </span>
            )}
        </div>
        {children}
        {error && (
            <p
                className="
                text-red-500
                text-xs
                mt-1
                ">
                {error}
            </p>
        )}
    </div>
);