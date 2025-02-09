// npm init -y
// npm install express ejs express-validator

// mkdir routes controllers views views/partials db public

// npm install dotenv pg

//npm install passport passport-local bcryptjs express-session

// npm install prisma typescript tsx @types/node --save-dev
// npm install @prisma/client

const express = require("express");
const app = express();
const router = require("./routes/router");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
require("./controllers/passportConfig")

app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
