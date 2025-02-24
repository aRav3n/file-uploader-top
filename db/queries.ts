import { PrismaClient, Prisma } from "@prisma/client";
import supabase from "./supabase.js";

const prisma = new PrismaClient();

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

async function moveFilesToFolder(currentFolderId, newFolderId, user) {
  try {
    await prisma.file.updateMany({
      where: { folderId: currentFolderId, userId: user.id },
      data: { folderId: newFolderId },
    });
  } catch (err) {
    console.error("Error moving files from folder:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function addFile(userId, folderId, filename, file) {
  try {
    const url = await supabase.uploadFile(userId, file, filename);
    if (url) {
      await prisma.file.create({
        data: {
          userId: userId,
          name: filename,
          folderId: folderId,
          filePath: url,
        },
      });
    }
    return;
  } catch (err) {
    console.error("Error adding file:", err);
  } finally {
    await prisma.$disconnect();
  }
}

export async function addFolder(userId, folderName) {
  try {
    const folder = await prisma.folder.create({
      data: {
        userId: userId,
        name: folderName,
      },
    });
    return folder;
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

export async function deleteFile(fileId, user) {
  const id = Number(fileId);
  try {
    await prisma.file.delete({
      where: { id: id, userId: user.id },
    });
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteFolder(folderId, user) {
  const id = Number(folderId);
  try {
    await moveFilesToFolder(id, null, user);
    await prisma.folder.delete({
      where: { id: id },
    });
  } catch (err) {
    console.error("Error deleting folder:", err);
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

export async function findAllUserFolders(userId) {
  try {
    const id = Number(userId);
    let folders = await prisma.folder.findMany({
      where: { userId: id },
    });
    if (folders.length === 0) {
      const newMainFolder = await addFolder(id, "Main");
      const user = await findUserById(id);
      if (newMainFolder) {
        moveFilesToFolder(null, newMainFolder.id, user);
      }
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

export async function findFile(fileId) {
  try {
    const id = Number(fileId);
    const file = await prisma.file.findFirst({
      where: { id: id },
    });
    return file;
  } catch (err) {
    console.error("Error finding file:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
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
