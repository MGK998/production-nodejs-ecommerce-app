import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

//Create Orders
export async function creatOrderController(req, res) {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    //validation
    // if (
    //   !shippingInfo ||
    //   !orderItems ||
    //   !paymentMethod ||
    //   !paymentInfo ||
    //   !itemPrice ||
    //   !tax ||
    //   !shippingCharges ||
    //   !totalAmount
    // ) {
    //   return res.status(404).send({
    //     success: false,
    //     message: "Provide all the fields",
    //   });
    // }
    //create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    //stock update
    for (let i = 0; i < orderItems.length; i++) {
      //find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }

    res.status(201).send({
      success: true,
      message: "Order Placed/Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Create Order API",
      error,
    });
  }
}

//Get all Orders - My orders
export async function getMyOrdersController(req, res) {
  try {
    //find orders
    const orders = await orderModel.find({ user: req.user._id });
    //validation
    if (!orders) {
      return res.status(404).send({
        success: falsle,
        message: "No orders found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Yours orders data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get My Order API",
      error,
    });
  }
}

//get single order details from a unique user
export async function getSingleOrderDetailsController(req, res) {
  try {
    //find orders
    const order = await orderModel.findById(req.params.id);
    //validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No Order Found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Your order fetched",
      order,
    });
  } catch (error) {
    console.log(error);
    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in get single MyOrder API",
      error,
    });
  }
}

//Accept payment for orders

export async function paymentsController(req, res) {
  try {
    //get total amount
    const { totalAmount } = req.body;
    //validation
    if (!totalAmount) {
      res.status(404).send({
        success: false,
        message: "Total Amount is required",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });
    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error Accept payments API",
      error,
    });
  }
}

/*===========ADMIN SECTION=============*/
//get all orders
export async function getAllOrderController(req, res) {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All orders data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all order from admin API",
      error,
    });
  }
}

//change order status from admin
export async function changeOrderStatusController(req, res) {
  try {
    //find order
    const order = await orderModel.findById(req.params.id);
    //validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }
    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "order already delivered",
      });
    }
    await order.save();
    res.status(200).send({
      success: true,
      message: "Order Status updated",
    });
  } catch (error) {
    console.log(error);
    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in change order status API",
      error,
    });
  }
}
