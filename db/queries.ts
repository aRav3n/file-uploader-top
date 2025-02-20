import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function addFile(userId, folderId, fileName, filePath) {
  try {
    await prisma.file.create({
      data: {
        userId: userId,
        description: fileName,
        folderId: folderId,
        filePath: filePath,
      },
    });
    return;
  } catch (err) {
    console.error("Error adding file:", err);
  } finally {
    await prisma.$disconnect();
  }
}

export async function addFolder(userId, folderName) {
  try {
    await prisma.folder.create({
      data: {
        userId: userId,
        name: folderName,
      },
    });
    return;
  } catch (err) {
    console.error("Error adding folder:", err);
  } finally {
    await prisma.$disconnect();
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

export async function findAllFolderFiles(folderId) {
  try {
    const id = Number(folderId);
    const files = await prisma.file.findMany({
      where: { folderId: id },
    });
    return files;
  } catch (err) {
    console.error("Error finding folder's files:", err);
  }
}

export async function findAllUserFolders(userId) {
  try {
    const id = Number(userId);
    let folders = await prisma.folder.findMany({
      where: { userId: id },
    });
    if (folders.length === 0) {
      await addFolder(id, "Home");
      folders = await prisma.folder.findMany({
        where: { userId: id },
      });
    }
    return folders;
  } catch (err) {
    console.error("Error finding user's folders:", err);
  }
}

export async function findAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Error in findAllUsers:", error);
  }
}

export async function findFolder(folderId) {
  try {
    const id = Number(folderId);
    const folder = await prisma.folder.findFirst({
      where: { id: id },
    });
    return folder;
  } catch (err) {
    console.error("Error finding folder:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function findFolderId(userId, folderName) {
  try {
    const id = Number(userId);
    const folder = await prisma.folder.findFirst({
      where: { userId: id, name: folderName },
    });
    const folderId = folder?.id;
    return folderId;
  } catch (err) {
    console.error("Error finding folder id:", err);
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

export async function findUserById(userId) {
  try {
    const id = Number(userId);
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
