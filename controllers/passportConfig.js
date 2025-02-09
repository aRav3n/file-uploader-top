const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// const db = require("../db/queries");
// const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, {
          message: `User name ${username} not found`,
        });
      }
      if (!bcrypt.compareSync(password, user.hash)) {
        return done(null, false, { message: "Password incorrect" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("serializing user with id of ", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await db.findUserById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
});