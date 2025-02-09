// const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
const { addUser } = require("../db/queries.ts");
const { title } = require("process");

const nameLengthErr = "must be between 1 and 10 characters";

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
    title: "Users",
    user: user,
  });
  return;
}

function loginGet(req, res, next) {
  const user = req.user;
  res.render("login", {
    title: "Login",
    user: user,
  });
}

const loginPost = [
  validateUser,
  async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  },
];

async function signupGet(req, res, next) {
  const user = req.user;
  res.render("signup", {
    title: "Sign Up",
    user: user,
  });
}

const signupPost = [
  validateUser,
  async (req, res, next) => {
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

      res.render("/signup", {
        title: "Sign Up",
        errors: [{ msg: "Failed to create user. Please try again." }],
      });
      return;
    }
  },
];

module.exports = {
  indexGet,
  loginGet,
  loginPost,
  signupGet,
  signupPost,
};
