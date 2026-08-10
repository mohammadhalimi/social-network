import { SPECIAL_CHARS } from "./RegisterSchema";

export const FormInput = ({
    label,
    type,
    placeholder,
    register,
    error,
    helpText,
    showPasswordHint
}: {
    label: string;
    type: string;
    placeholder: string;
    register: any;
    error?: string;
    helpText?: string;
    showPasswordHint?: boolean;
}) => {
    const inputId = register.name;

    return (
        <div>
            <label
                htmlFor={inputId}
                className="
                block
                text-sm
                font-medium
                text-primary
                mb-1
            ">
                {label}
            </label>
            <input
                id={inputId}
                {...register}
                type={type}
                className="input-light"
                placeholder={placeholder}
            />
            {error && (
                <p
                    className="
                    text-red-500
                    text-sm
                    mt-1
                ">
                    {error}
                </p>
            )}
            {helpText && !error && (
                <p
                    className="
                    text-secondary
                    text-xs
                    mt-1
                ">
                    {helpText}
                </p>
            )}
            {showPasswordHint && !error && (
                <p
                    className="
                    text-secondary
                    text-xs
                    mt-1
                ">
                    کاراکترهای خاص مجاز:{" "}
                    <span
                        className="
                        font-mono
                        bg-card
                        border
                        border-border
                        px-1
                        rounded
                        text-primary
                    ">
                        {SPECIAL_CHARS}
                    </span>
                </p>
            )}
        </div>
    );
};