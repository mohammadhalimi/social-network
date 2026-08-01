'use client';

import { motion } from 'framer-motion';
import { RegisterForm } from '@/app/components/auth/register/RegisterForm';

export default function RegisterPage() {
  return (
    <div
      className="
    min-h-screen
    flex
    items-center
    justify-center
    p-4
    relative
    overflow-hidden
    ">
      {/* ✅ پس‌زمینه */}
      <div
        className="
      absolute
      inset-0
      bg-gradient-to-br
      from-rose-50
      via-white
      to-teal-50
      ">
        <motion.div
          className="
          absolute
          top-[-20%]
          right-[-10%]
          w-[500px]
          h-[500px]
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
            ease: "linear",
          }}
        />
        <motion.div
          className="
          absolute
          bottom-[-20%]
          left-[-10%]
          w-[600px]
          h-[600px]
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
            ease: "linear",
          }}
        />
        <motion.div
          className="
          absolute
          top-[50%]
          left-[50%]
          translate-x-[-50%]
          translate-y-[-50%]
          w-[300px]
          h-[300px]
          rounded-full
          bg-accent1/10
          blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ✅ کارت ثبت‌نام */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
        relative
        z-10
        w-full
        max-w-md"
      >
        <div className="
        card
        shadow-xl
        ">
          {/* ✅ لوگو */}
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
              text-whit
              ">
                🚀
              </span>
            </div>
          </div>

          <div
            className="
          text-center
          mb-8
          ">
            <h2 className="text-3xl
            font-bold
            text-text-primary
            ">
              خوش آمدید! ✨
            </h2>
            <p
              className="
            mt-2
            text-text-secondary
            ">
              عضو جدید؟ همین حالا ثبت‌نام کن
            </p>
          </div>
          <RegisterForm />
        </div>
      </motion.div>
    </div>
  );
}