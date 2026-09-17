'use client';

export const ProfileLoading = () => {
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
                    w-12
                    h-12
                    border-4
                    border-primary
                    border-t-transparent
                    rounded-full
                    animate-spin
                    mx-auto
                "/>
                <p
                    className="
                    mt-4
                    text-secondary
                ">
                    در حال بارگذاری...</p>
            </div>
        </div>
    );
};