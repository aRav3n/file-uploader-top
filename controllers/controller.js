const { body, validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
const {
  addFile,
  addFolder,
  addUser,
  deleteFile,
  deleteFolder,
  deleteUser,
  findAllFolderFiles,
  findAllUserFolders,
  findAllUsers,
  findFile,
  findFolder,
  findFolderId,
  findUserById,
} = require("../db/queries.ts");
const { title } = require("process");
const path = require("path");

const nameLengthErr = "must be between 1 and 10 characters";
let errors = false;

// validations

const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage(`User name ${nameLengthErr}`),
  body("password")
    .trim()
    .isLength({ min: 6, max: 16 })
    .withMessage("Password must be between 6 and 16 characters"),
  body("confirmPassword")
    .exists()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return false;
      }
      return true;
    })
    .withMessage("Passwords must match")
    .trim(),
  body("adminPassword").trim(),
];

const validateFile = [body("filename").trim(), body("folder").trim()];

// internal use functions

function generateHash(string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(string, salt);

  return hash;
}

async function getUserInfoFromReq(req) {
  if ("passport" in req.session) {
    const userId = req.session.passport.user;
    const user = await findUserById(userId);
    return user;
  }
  return false;
}

function checkOwnership(item, user) {
  let isOwner = false;
  if (item.userId === user.id) {
    isOwner = true;
  }
  return isOwner;
}

// export functions for router

async function deleteAccountGet(req, res, next) {
  const user = await getUserInfoFromReq(req);
  res.render("deleteAccount", {
    title: "Delete Account",
    user: user,
    errors: errors,
  });
  errors = false;
}

async function deleteAccountPost(req, res, next) {
  const userId = req.params.userId;
  await deleteUser(userId);
  res.redirect("/");
}

async function deleteFileGet(req, res, next) {
  const fileId = Number(req.params.fileId);
  if (isNaN(fileId)) {
    return res.status(400).send("Invalid file ID");
  }

  const file = await findFile(fileId);
  const user = await getUserInfoFromReq(req);
  const okToAccess = checkOwnership(file, user);

  if (okToAccess) {
    res.render("deleteFile", {
      title: file.name,
      user: user,
      file: file,
      errors: errors,
    });
    errors = false;
    return;
  }

  errors = [{ msg: "You're not authorized to access that file" }];
  res.redirect("/");
}

async function deleteFilePost(req, res, next) {
  const fileId = Number(req.params.fileId);
  if (isNaN(fileId)) {
    return res.status(400).send("Invalid file ID");
  }

  const file = await findFile(fileId);
  const user = await getUserInfoFromReq(req);
  const okToAccess = checkOwnership(file, user);

  if (okToAccess) {
    deleteFile(fileId, user);
    res.redirect("/");
    return;
  }

  errors = [{ msg: "You're not authorized to delete that file" }];
  res.redirect("/");
}

async function deleteFolderGet(req, res, next) {
  const folderId = Number(req.params.folderId);
  if (isNaN(folderId)) {
    return res.status(400).send("Invalid folder ID");
  }

  const folder = await findFolder(folderId);
  const user = await getUserInfoFromReq(req);
  const okToAccess = checkOwnership(folder, user);

  if (okToAccess) {
    res.render("deleteFolder", {
      title: folder.name,
      user: user,
      folder: folder,
      errors: errors,
    });
    errors = false;
    return;
  }

  errors = [{ msg: "You're not authorized to access that folder" }];
  res.redirect("/");
}

async function deleteFolderPost(req, res, next) {
  const folderId = Number(req.params.folderId);
  if (isNaN(folderId)) {
    return res.status(400).send("Invalid folder ID");
  }

  const folder = await findFolder(folderId);
  const user = await getUserInfoFromReq(req);
  const okToAccess = checkOwnership(folder, user);

  if (okToAccess) {
    deleteFolder(folderId, user);
    res.redirect("/");
    return;
  }

  errors = [{ msg: "You're not authorized to delete that folder" }];
  res.redirect("/");
}

async function deleteUsersGet(req, res, next) {
  const user = await getUserInfoFromReq(req);

  const userIsAdmin = user.admin;
  if (!userIsAdmin) {
    res.redirect("/");
  }

  const allUsers = await findAllUsers();

  res.render("deleteUsers", {
    allUsers: allUsers,
    title: "Delete Users",
    user: user,
    errors: errors,
  });
  errors = false;
}

async function errorGet(req, res, next) {
  const user = await getUserInfoFromReq(req);
  res.render("errorPage", {
    title: "404 Not Found",
    user: user,
    errors: errors,
  });
  errors = false;
}

async function filePageGet(req, res, next) {
  const fileId = Number(req.params.fileId);
  if (isNaN(fileId)) {
    return res.status(400).send("Invalid file ID");
  }

  const file = await findFile(fileId);
  const user = await getUserInfoFromReq(req);
  const okToAccess = checkOwnership(file, user);
  if (okToAccess) {
    res.render("file", {
      file: file,
      title: file.name,
      user: user,
      errors: errors,
    });
    errors = false;
    return;
  }

  errors = [{ msg: "You're not authorized to access that file" }];
  res.redirect("/");
}

async function folderPageGet(req, res, next) {
  const folderId = Number(req.params.folderId);
  if (isNaN(folderId)) {
    return res.status(400).send("Invalid folder ID");
  }

  const user = await getUserInfoFromReq(req);

  const folder = await findFolder(folderId);
  const okToAccess = checkOwnership(folder, user);

  if (okToAccess) {
    const files = await findAllFolderFiles(folderId);
    res.render("folder", {
      title: folder.name,
      user: user,
      files: files,
      folder: folder,
      errors: errors,
    });
    errors = false;
    return;
  }

  errors = [{ msg: "You're not authorized to access that folder" }];
  res.redirect("/");
}

async function indexGet(req, res) {
  const user = await getUserInfoFromReq(req);
  if (!user) {
    res.redirect("/login");
    return;
  }

  const folders = await findAllUserFolders(user.id);
  res.render("index", {
    title: "Home",
    user: user,
    folders: folders,
    errors: errors,
  });
  errors = false;
  return;
}

async function loginGet(req, res, next) {
  const user = await getUserInfoFromReq(req);

  if (user) {
    res.redirect("/");
  }

  res.render("login", {
    title: "Login",
    user: user,
    errors: errors,
  });
  errors = false;
  return;
}

async function loginPost(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      errors = [{ msg: "No user with that username or password found" }];
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
}

async function logoutPost(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function signupGet(req, res, next) {
  const user = await getUserInfoFromReq(req);
  res.render("signup", {
    title: "Sign Up",
    user: user,
    errors: errors,
  });
  errors = false;
}

const signupPost = [
  validateUser,
  async (req, res, next) => {
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.errors;
      return res.status(400).redirect("/signup");
    }

    const username = req.body.username;
    const hash = generateHash(req.body.password);
    const adminHash = generateHash(process.env.ADMIN_PASSWORD);
    const admin = bcrypt.compareSync(req.body.adminPassword, adminHash);

    try {
      await addUser(username, hash, admin);
      res.redirect("/");
      return;
    } catch (error) {
      console.error("Error creating user:", error);
      errors = [{ msg: "Failed to create user. Please try again." }];

      res.redirect("/signup");
      return;
    }
  },
];

async function uploadFileGet(req, res, next) {
  const user = await getUserInfoFromReq(req);
  const userId = user.id;
  const userFolders = await findAllUserFolders(userId);

  res.render("uploadFile", {
    title: "Upload",
    user: user,
    folders: userFolders,
    errors: errors,
  });
  errors = false;
  return;
}

const uploadFilePost = [
  validateFile,
  async (req, res, next) => {
    const user = await getUserInfoFromReq(req);
    const userId = user.id;
    const file = req.file;
    const filename =
      req.body.filename.length > 0 ? req.body.filename : req.file.originalname;
    const folderName = req.body.folder;
    const folderId = await findFolderId(userId, folderName);

    if (file) {
      const relativePath = req.file.path;
      const parentFolderDirname = path.join(__dirname, "..");
      const filePath = path.join(parentFolderDirname, relativePath);
      await addFile(userId, folderId, filename, filePath);
      res.redirect("/");
    }
  },
];

module.exports = {
  deleteAccountGet,
  deleteAccountPost,
  deleteFileGet,
  deleteFilePost,
  deleteFolderGet,
  deleteFolderPost,
  deleteUsersGet,
  errorGet,
  filePageGet,
  folderPageGet,
  indexGet,
  loginGet,
  loginPost,
  logoutPost,
  signupGet,
  signupPost,
  uploadFileGet,
  uploadFilePost,
};
