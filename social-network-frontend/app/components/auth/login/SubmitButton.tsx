'use client'

import { motion } from "framer-motion";
import { Rocket } from "./svg/rocket";
export const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <motion.button
    type="submit"
    disabled={isSubmitting}
    className="
    btn-primary
    w-full
    text-center
    flex
    items-center
    justify-center
    gap-2"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  >
    {isSubmitting ? (
      <>
        <Rocket />
        در حال ورود...
      </>
    ) : (
      'ورود 🚀'
    )}
  </motion.button>
);