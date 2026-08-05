import {
    OpenEyes,
    ClosedEyes
} from "./svg/PasswordEye";

export default function PasswordField({
    register,
    placeholder,
    visible,
    onToggle }: any) {
    return (
        <div
            className="relative">
            <input
                {...register}
                type={visible ? 'text' : 'password'}
                className="
                input-light
                pl-10"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={onToggle}
                tabIndex={-1}
                className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-text-secondary
                hover:text-text-primary
                focus:outline-none"
                aria-label={visible ? 'پنهان کردن رمز' : 'نمایش رمز'}
            >
                {visible ? (
                    <OpenEyes />
                ) : (
                    <ClosedEyes />
                )}
            </button>
        </div>
    );
}