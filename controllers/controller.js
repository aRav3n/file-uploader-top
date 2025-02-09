// const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
const { addUser, findUser, showAllUsers } = require("../db/queries.ts");
const { title } = require("process");

const alphaErr = "must only contain letters";
const nameLengthErr = "must be between 1 and 10 characters";
const emailErr = "must be a valid email";

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
];

function generateHash(string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(string, salt);

  return hash;
}

async function indexGet(req, res) {
  console.log("user:", req.user, "session:", req.session);
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  res.render("index", {
    title: "Users",
  });
  return;
}

function loginGet(req, res, next) {
  res.render("login", {
    title: "Login",
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
  res.render("signup", {
    title: "Sign Up",
  });
}

const signupPost = [
  validateUser,
  async (req, res, next) => {
    const username = req.body.username;
    const hash = generateHash(req.body.password);

    try {
      await addUser(username, hash);
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
