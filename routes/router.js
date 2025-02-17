const { Router } = require("express");
const controller = require("../controllers/controller");
const router = Router();

router.get("/", controller.indexGet);

router.get("/deleteUsers", controller.deleteUsersGet);
router.get("/deleteAccount", controller.deleteAccountGet);
router.post("/deleteAccount/:userId", controller.deleteAccountPost);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.post("/logout", controller.logoutPost);

router.get("/signup", controller.signupGet);
router.post("/signup", controller.signupPost);

router.get("/uploadFile", controller.uploadFileGet);
router.post("/uploadFile", controller.uploadFilePost);

router.use("*", controller.errorGet);

module.exports = router;
