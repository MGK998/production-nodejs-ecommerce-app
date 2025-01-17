import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  createCategory,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//routes
//--CATEGORY ROUTES

//Create Category
router.post("/create", isAuth, isAdmin, createCategory);

//Get All Category
router.get("/get-all", getAllCategoriesController);

//Delete Category
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

//update Category
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

export default router;
