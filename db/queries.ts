import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function findAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Error in findAllUsers:", error);
  }
}

export async function addUser(username, hash, admin) {
  try {
    admin === true ? (admin = true) : (admin = false);
    const user = await prisma.user.create({
      data: {
        username: username,
        hash: hash,
        admin: admin,
      },
    });
    findAllUsers();
    return user;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteUser(userId) {
  userId = Number(userId);
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (err) {
    console.error("Error deleting user:", err);
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
