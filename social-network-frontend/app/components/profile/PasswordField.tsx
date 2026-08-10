'use client';

import {
    OpenEyes,
    ClosedEyes
} from './svg/PasswordEye';

interface PasswordFieldProps {
    register: any;
    placeholder: string;
    visible: boolean;
    onToggle: () => void;
}

export default function PasswordField({
    register,
    placeholder,
    visible,
    onToggle,
}: PasswordFieldProps) {
    return (
        <div
            className="
            relative
            ">
            <input
                {...register}
                type={visible ? 'text' : 'password'}
                className="
                input-light
                pl-10
                "
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={onToggle}
                tabIndex={-1}
                className="absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-secondary
                hover:text-primary
                focus:outline-none
                transition-colors
                duration-200"
                aria-label={visible ? 'پنهان کردن رمز' : 'نمایش رمز'}
            >
                {visible ? <OpenEyes /> : <ClosedEyes />}
            </button>
        </div>
    );
}