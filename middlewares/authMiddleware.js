import JWT from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

//USER AUTHENTICATION
export async function isAuth(req, res, next) {
  const { token } = req.cookies;
  //validation
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "UnAuthorized User",
    });
  }

  const decodeData = JWT.verify(token, process.env.JWT_SECRET); //this will decode the token
  req.user = await userModel.findById(decodeData._id);
  next();
}

//ADMIN AUTHENTICATION
export async function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "admin only",
    });
  }
  next();
}
