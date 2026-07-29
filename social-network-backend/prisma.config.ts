import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// بارگذاری صریح فایل env از مسیر درست
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});