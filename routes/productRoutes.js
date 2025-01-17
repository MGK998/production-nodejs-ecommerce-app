import express from "express";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSingleProductController,
  getTopProductsController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//routes
//get all products
router.get("/get-all", getAllProductsController);

//get top products based on rating
router.get("/get-top", getTopProductsController);

//get single products
router.get("/:id", getSingleProductController);

//create product
router.post("/create", isAuth, singleUpload, isAdmin, createProductController);

//update product details
router.put("/:id", isAuth, isAdmin, updateProductController);

//update product image
router.put(
  "/image/:id",
  isAuth,
  singleUpload,
  isAdmin,
  updateProductImageController
);

//delete product image
router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController
);

//delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

//REVIEW PRODUCT
router.put("/:id/review", isAuth, productReviewController);

export default router;
