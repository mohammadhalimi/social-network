'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface SuccessMessageProps {
    icon: string;           // آیکون (مثلاً ✅ یا 📧)
    title: string;          // عنوان اصلی
    message: string;        // پیام توضیحی
    buttonText: string;     // متن دکمه
    buttonLink: string;     // لینک دکمه
    children?: ReactNode;   // محتوای اضافی (اختیاری)
}

export const SuccessMessage = ({
    icon,
    title,
    message,
    buttonText,
    buttonLink,
    children,
}: SuccessMessageProps) => (
    <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        bg-background
  ">
        <div
            className="
            bg-card
            border
            border-border
            rounded-2xl
            p-8
            shadow-soft
            max-w-md
            w-full
            text-center
        ">
            <div
                className="
                text-6xl
                mb-4
            ">
                {icon}
            </div>
            <h2
                className="
                text-2xl
                font-bold
                text-primary
                mb-2
            ">
                {title}
            </h2>
            <p
                className="
                text-secondary
                mb-6
            ">
                {message}
            </p>
            {children}
            <Link
                href={buttonLink}
                className="
                btn-primary
                w-full
                text-center
                block
                ">
                {buttonText}
            </Link>
        </div>
    </div>
);