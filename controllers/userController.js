import { userModel } from "../models/userModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
export async function registerController(req, res) {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;
    //validation
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All fields",
      });
    }

    //check existing user
    const existingUser = await userModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "Email already taken",
      });
    }

    //this will create the user API
    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "Registration Success, Please Login",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
}

//login controller
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please add email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    //user validation
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User Not Found",
      });
    }

    //check password
    const isMatch = await user.comparePassword(password);

    //validation password
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    //token
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successful",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login API",
      error,
    });
  }
}

//GET USER PROFILE
export async function getUserProfileController(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined; //to hide the whole password field
    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Profile API",
      error,
    });
  }
}

//function for logout
export async function logoutController(req, res) {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in LogOut API",
      error,
    });
  }
}

//function for update user profile
export async function updateProfileController(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone } = req.body; //when we provide some object in raw body in postman tool that is req.body

    //validation +update
    if (name) user.name = name; // Update name only if provided
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile API",
      error,
    });
  }
}

//function for update user password

export async function updatePasswordController(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //validation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }

    //old password check
    const isMatch = await user.comparePassword(oldPassword);

    //validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid old Password",
      });
    }
    user.password = newPassword; //this will update user.password i.e. old password with newPassword
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update password API",
      error,
    });
  }
}

//function for update user profile photo
export async function updateProfilePicController(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    const file = getDataUri(req.file); //getting new file/photo from user

    await cloudinary.v2.uploader.destroy(user.profilePic.public_id); //this will delete prev or existing pofileimage of user

    const cdb = await cloudinary.v2.uploader.upload(file.content); //now update process andn cdb have stored file/photo
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //save function
    await user.save();

    res.status(200).send({
      success: true,
      message: "profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile pic API",
      error,
    });
  }
}

//forgot password
export async function passwordResetController(req, res) {
  try {
    //from user, get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    //validation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }
    //find user and answer
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid user or answer",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your password has been reset, Please login",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in reset password API",
      error,
    });
  }
}
