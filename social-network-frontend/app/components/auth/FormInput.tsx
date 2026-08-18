'use client';

import { motion } from 'framer-motion';

interface FormInputProps {
    label: string;
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder: string;
    register: any;
    error?: string;
    delay?: number;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
}

export const FormInput = ({
    label,
    type = 'text',
    placeholder,
    register,
    error,
    delay = 0,
    required = false,
    disabled = false,
    className = '',
    inputClassName = '',
    labelClassName = '',
}: FormInputProps) => {
    const id = register.name;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay }}
            className={className}
        >
            <label
                htmlFor={id}
                className={`
                    block
                    text-sm
                    font-medium
                    text-primary
                    mb-1
                    ${required ? "after:content-['*'] after:text-red-500 after:mr-1" : ''}
                    ${labelClassName}
                `}
            >
                {label}
            </label>

            <input
                id={id}
                {...register}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    input-light
                    w-full
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${inputClassName}
                `}
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
        </motion.div>
    );
};