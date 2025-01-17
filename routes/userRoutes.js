import express from "express";
import {
  getUserProfileController,
  logoutController,
  passwordResetController,
  registerController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
} from "../controllers/userController.js";
import { loginController } from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import { rateLimit } from "express-rate-limit";

//RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

//router object

const router = express.Router();

//routes
//route for register
router.post("/register", limiter, registerController);
//route for login
router.post("/login", limiter, loginController);

//route for profile
router.get("/profile", isAuth, getUserProfileController); //here isAuth is the middleware

//route for logout
router.get("/logout", isAuth, logoutController);

//route for update profile
router.put("/profile-update", isAuth, updateProfileController);

//route for update password
router.put("/update-password", isAuth, updatePasswordController);

//route for update profile pic
router.put("/update-picture", isAuth, singleUpload, updateProfilePicController);

//Forgot Password
router.post("/reset-password", passwordResetController);

//export
export default router;
