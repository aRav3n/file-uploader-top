const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
const { addUser, deleteUser, findAllUsers } = require("../db/queries.ts");
const { title } = require("process");

const nameLengthErr = "must be between 1 and 10 characters";
let errors = false;

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

function generateHash(string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(string, salt);

  return hash;
}

async function indexGet(req, res) {
  const user = req.user;

  if (!user) {
    res.redirect("/login");
    return;
  }
  res.render("index", {
    title: "Home",
    user: user,
    errors: errors,
  });
  errors = false;
  return;
}

function loginGet(req, res, next) {
  const user = req.user;

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
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function signupGet(req, res, next) {
  const user = req.user;
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

async function deleteAccountGet(req, res, next) {
  const user = req.user;
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

async function deleteUsersGet(req, res, next) {
  const user = req.user;

  const userIsAdmin = req.user.admin;
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

function errorGet(req, res, next) {
  const user = req.user;
  res.render("errorPage", {
    title: "404 Not Found",
    user: user,
    errors: errors,
  });
  errors = false;
}

module.exports = {
  deleteAccountGet,
  deleteAccountPost,
  deleteUsersGet,
  errorGet,
  indexGet,
  loginGet,
  loginPost,
  logoutPost,
  signupGet,
  signupPost,
};
