'use client';

import { motion } from 'framer-motion';
import { ConfirmCircle } from '../svg/ConfirmCircle';

interface SubmitButtonProps {
    isLoading: boolean;
    isUploading: boolean;
}

export const SubmitButton = ({ isLoading, isUploading }: SubmitButtonProps) => (
    <div
        className="
     flex
     justify-end
     pt-2
     ">
        <motion.button
            type="submit"
            disabled={isLoading || isUploading}
            className="
         btn-primary
         w-full
         sm:w-auto
         sm:px-10
         flex
         items-center
         justify-center
         gap-2
         "
            whileTap={{ scale: 0.98 }}
        >
            {isLoading ? (
                <>
                    <ConfirmCircle />
                    در حال ذخیره...
                </>
            ) : (
                'ذخیره تغییرات'
            )}
        </motion.button>
    </div>
);