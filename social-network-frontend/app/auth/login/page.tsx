'use client';

import { motion } from 'framer-motion';
import LoginForm from '../../components/auth/login/LoginForm';

export default function LoginPage() {
  return (
    <div
      className="
      min-h-screen
      flex items-center
      justify-center
      p-4
      relative
      overflow-hidden
      bg-background
      ">
      <div
        className="
        absolute
        inset-0
        bg-background
        ">
        <motion.div
          className="
          absolute
          top-[-20%]
          right-[-10%]
          w-lg
          h-lg
          rounded-full
          bg-gradient-to-br
          from-primary/20
          to-accent1/20
          blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="
          absolute
          bottom-[-20%]
          left-[-10%]
          w-xl
          h-xl
          rounded-full
          bg-gradient-to-tr
          from-secondary/20
          to-accent2/20
          blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="
          absolute
          top-[50%]
          left-[50%]
          translate-x-[-50%]
          translate-y-[-50%]
          w-xs
          h-xs
          rounded-full
          bg-accent1/10
          blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
        relative
        z-10
        w-full
        max-w-md
        ">
        <div
          className="
          bg-card
          border
          border-border
          rounded-2xl
          p-8
          shadow-soft
          ">
          <div
            className="
            flex
            justify-center
            mb-6
            ">
            <div
              className="
              w-20
              h-20
              rounded-full
              bg-gradient-primary
              flex
              items-center
              justify-center
              shadow-glow-primary
              ">
              <span
                className="
                text-3xl
                font-bold
                text-white
                ">
                🔐
              </span>
            </div>
          </div>
          <div
            className="
          text-center
          mb-8
          ">
            <h2
              className="
            text-3xl
            font-bold
            text-primary
            ">خوش برگشتی! ✨
            </h2>
            <p
              className="
            mt-2
            text-secondary
            ">وارد حساب خود شوید
            </p>
          </div>
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}