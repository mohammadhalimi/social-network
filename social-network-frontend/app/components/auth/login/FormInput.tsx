import { motion } from "framer-motion";

export const FormInput = ({
    label,
    type,
    placeholder,
    register,
    error,
    delay,
}: {
    label: string;
    type: string;
    placeholder: string;
    register: any;
    error?: string;
    delay?: number;
}) => {
   const id = register.name;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: delay || 0 }}
        >
            <label
                htmlFor={id}
                className="
      block
      text-sm
      font-medium
      mb-1
      ">
                {label}
            </label>

            <input
                id={id}
                {...register}
                type={type}
                className="
                input-light
                "
                placeholder={placeholder}
            />

            {error && <p
                className="
            text-red-500
            text-sm mt-1
            ">
                {error}
            </p>}
        </motion.div>
    );
};