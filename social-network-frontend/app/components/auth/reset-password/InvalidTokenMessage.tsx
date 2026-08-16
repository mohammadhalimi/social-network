'use client';

import Link from 'next/link';

export const InvalidTokenMessage = () => (
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
                ❌
            </div>
            <h2
                className="
                text-2xl
                font-bold
                text-primary
                mb-2
            ">لینک نامعتبر
            </h2>
            <p
                className="
                text-secondary
                mb-6
            ">
                لینک بازنشانی رمز عبور نامعتبر یا منقضی شده است.
            </p>
            <Link
                href="/auth/forgot-password"
                className="btn-primary w-full text-center block"
            >
                درخواست مجدد
            </Link>
        </div>
    </div>
);