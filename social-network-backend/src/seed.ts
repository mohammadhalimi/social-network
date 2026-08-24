import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

import dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config();

// ✅ تنظیم adapter برای Prisma 7
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 شروع seeding...');

  const USER_COUNT = 1000;
  const defaultPassword = await bcrypt.hash('123456', 10);

  const users = [];
  for (let i = 0; i < USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '');
    const uniqueUsername = `${username}${faker.number.int({ min: 10, max: 99 })}`;

    users.push({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username: uniqueUsername,
      password: defaultPassword,
      fullName: faker.person.fullName({ firstName, lastName }),
      bio: faker.lorem.sentence({ min: 5, max: 15 }),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`✅ ${USER_COUNT} کاربر فیک با موفقیت ساخته شدند.`);
}

main()
  .catch((e) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });