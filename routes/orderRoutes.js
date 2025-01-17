import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  changeOrderStatusController,
  creatOrderController,
  getAllOrderController,
  getMyOrdersController,
  getSingleOrderDetailsController,
  paymentsController,
} from "../controllers/orderController.js";

const router = express.Router();

//routes
//--Order ROUTES

//Create Category
router.post("/create", isAuth, isAdmin, creatOrderController);

//Get all orders
router.get("/my-orders", isAuth, getMyOrdersController);

//Get single order details
router.get("/my-orders/:id", isAuth, getSingleOrderDetailsController);

//accept payment
router.post("/payments", isAuth, paymentsController);

/*======ADMIN PART========== */
//get all orders
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrderController);

//change order status
router.put("/admin/order/:id", isAuth, isAdmin, changeOrderStatusController);

export default router;
