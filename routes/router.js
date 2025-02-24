const { Router } = require("express");
const controller = require("../controllers/controller");
const router = Router();
const multer = require("multer");
const upload = multer();

router.get("/", controller.indexGet);

router.get("/deleteAccount", controller.deleteAccountGet);
router.post("/deleteAccount/:userId", controller.deleteAccountPost);

router.get("/deleteFile/:fileId", controller.deleteFileGet);
router.post("/deleteFile/:fileId", controller.deleteFilePost);

router.get("/deleteFolder/:folderId", controller.deleteFolderGet);
router.post("/deleteFolder/:folderId", controller.deleteFolderPost);

router.get("/deleteUsers", controller.deleteUsersGet);

router.post("/download/:fileId", controller.downloadFilePost);

router.get("/file/:fileId", controller.filePageGet);

router.get("/folder/:folderId", controller.folderPageGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.post("/logout", controller.logoutPost);

router.get("/signup", controller.signupGet);
router.post("/signup", controller.signupPost);

router.get("/uploadFile", controller.uploadFileGet);
router.post("/uploadFile", upload.single("file"), controller.uploadFilePost);

router.use("*", controller.errorGet);

module.exports = router;
