import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const system = await prisma.user.upsert({
    where: { name: 'system' },
    update: {},
    create: {
      name: 'system',
      email: 'system@chatroom.com',
      nickname: '系统',
      password: 'system',
      status: 1,
      role: 999,
    },
  });

  const admin = await prisma.user.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@chatroom.com',
      nickname: '管理员',
      password: '123456',
      role: 900,
    },
  });

  const testuser = await prisma.user.upsert({
    where: { name: 'usertest' },
    update: {},
    create: {
      name: 'usertest',
      email: 'user@chatroom.com',
      nickname: '测试用户',
      password: '123456',
    },
  });

  const default_room = await prisma.room.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      ownerId: 1,
      title: '默认房间',
      members: '[]',
    },
  });

  console.log({ system, admin, testuser, default_room });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
