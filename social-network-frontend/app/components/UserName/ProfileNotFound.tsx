'use client';

import Link from 'next/link';

export const ProfileNotFound = () => {
    return (
        <div
            className="
            min-h-screen
            flex
            items-center
            justify-center
        ">
            <div
                className="
                text-center
            ">
                <div
                    className="
                    text-6xl
                    mb-4
                ">
                    ❌
                </div>
                <h1
                    className="
                    text-2xl
                    font-bold
                    text-primary
                    mb-2
                ">
                    کاربر یافت نشد
                </h1>
                <p
                    className="
                    text-secondary
                    ">
                    کاربری با این نام کاربری وجود ندارد.
                </p>
                <Link
                    href="/search"
                    className="
                    btn-primary
                    mt-6
                    inline-block
                ">
                    بازگشت به جستجو
                </Link>
            </div>
        </div>
    );
};