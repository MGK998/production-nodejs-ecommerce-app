import productModel from "../models/productModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

//Functcion for GET ALL PRODUCTS
export async function getAllProductsController(req, res) {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: { $regex: keyword ? keyword : "", $options: "i" },
        // category: category ? category : undefined,
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "All products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all product API",
      error,
    });
  }
}

//function for get top product based on rating
export async function getTopProductsController(req, res) {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "top 3 products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get top product API",
      error,
    });
  }
}

//function for get single product
export async function getSingleProductController(req, res) {
  try {
    //get product id
    const product = await productModel.findById(req.params.id);

    //validation

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Product found",
      product,
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
      message: "Error in get single product API",
      error,
    });
  }
}

//create product

export async function createProductController(req, res) {
  try {
    const { name, description, price, category, stock } = req.body;

    //validation
    if (!name || !description || !price || !stock) {
      return res.status(500).send({
        success: false,
        message: "Please Provide all fields",
      });
    }

    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Product Images",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in get create product API",
      error,
    });
  }
}

//update product

export async function updateProductController(req, res) {
  try {
    //find product
    const product = await productModel.findById(req.params.id);
    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, stock, category } = req.body;
    //validate and update
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    res.status(200).send({
      success: true,
      message: "product details updated",
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
      message: "Error in get update product API",
      error,
    });
  }
}

//update product image
export async function updateProductImageController(req, res) {
  try {
    //find product
    const product = await productModel.findById(req.params.id);
    //validation
    if (!product) {
      return res.status(404).send({
        success: true,
        message: "Product not found",
      });
    }
    //check the image file in product
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product Image not found",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);

    const image = {
      //this is from new or latest image from user
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //save
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product Image updated",
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
      message: "Error in get update image product API",
      error,
    });
  }
}

//delete product image

export async function deleteProductImageController(req, res) {
  try {
    //find product
    const product = await productModel.findById(req.params.id);
    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    //find image id
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }
    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Not found",
      });
    }

    //delete product image
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id); //this deletes from cloudinary
    product.images.splice(isExist, 1); //this deletes from database i.e. mongodb
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product Image Deleted Successfully",
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
      message: "Error in delete image product API",
      error,
    });
  }
}

//Delete Product

export async function deleteProductController(req, res) {
  try {
    //find product
    const product = await productModel.findById(req.params.id); //this means https:///delete/12fghij65 , here id=12fghij65 of a product
    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    //find and delete image from cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
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
      message: "Error in delete product API",
      error,
    });
  }
}

//Create product review and comment
export async function productReviewController(req, res) {
  try {
    const { comment, rating } = req.body;
    //find product
    const product = await productModel.findById(req.params.id);
    //check previous review/comment
    const alreadyReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    ); //if the loginUser or requesting user equal to user that had existing comment
    if (alreadyReview) {
      return res.status(400).send({
        success: false,
        message: "Product already reviewed",
      });
    }
    //review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    //passing review object to reviews array in product model
    product.reviews.push(review);
    //number or reviews
    product.totReviews = product.reviews.length;

    //this will calculate overall product rating based on all user rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    //save
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review Added",
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
      message: "Error in product review API",
      error,
    });
  }
}
