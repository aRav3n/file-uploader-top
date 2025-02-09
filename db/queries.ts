import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function showAllUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("all users:", users);
    return;
  } catch (error) {
    console.error("Error in showAllUsers:", error);
  }
}

export async function addUser(username, hash, admin) {
  try {
    admin === true ? admin = true : admin = false;
    const user = await prisma.user.create({
      data: {
        username: username,
        hash: hash,
        admin: admin,
      },
    });
    showAllUsers();
    return user;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function findUser(username) {
  try {
    const user = await prisma.user.findFirst({
      where: { username: username },
    });
    return user;
  } catch (err) {
    console.error("Error finding user:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function findUserById(id) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: id },
    });
    return user;
  } catch (err) {
    console.error("Error finding user:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}
