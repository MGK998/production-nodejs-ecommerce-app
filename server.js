import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

//dot env config -> this should always be first after import
dotenv.config();

//database connection
connectDB();

//stripe configuration
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

//cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//rest object
const app = express();

//middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//route and
//routes import
import testRoutes from "./routes/testRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import catgoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
app.use("/api/v1", testRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", catgoryRoutes);
app.use("/api/v1/order", orderRoutes);

//this is for homepage i.e. https://localhost:8080
app.get("/", (req, res) => {
  return res.status(200).send("<h1>Welcome To Node Server</h1>");
});

//port
const PORT = process.env.PORT || 8080; //this PORT is from .env file variable

//listen
app.listen(PORT, () => {
  console.log(
    `Server Running on PORT ${process.env.PORT} on ${process.env.NODE_ENV} Mode`
      .bgMagenta.white
  );
});
