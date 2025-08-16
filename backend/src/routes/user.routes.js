import express from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import generateAccessAndRefreshToken from "../utils/tokens.js";

const router = express.Router();

//register route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password].some((field) => field?.trim() == "")) {
    return res.status(400).json({ message: "all fields are required" });
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res.status(409).json({ message: "User is already exist" });
  }

  // allow role only for trusted registration
  const userRole = ["admin", "customer"].includes(role) ? role : "customer";

  try {
    const user = new User({ name, email, password, role: userRole });
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering a user" });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production", //cookies share only on https true in production
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: createdUser,
        refreshToken,
        accessToken,
        message: "User registered successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while registering a user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      //sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    /*
    Localhost / Dev mode → Avoid SameSite=None unless tum HTTPS + Secure use kar rahe ho.
    Production (HTTPS enabled) → Agar tum API aur frontend alag domain pe use kar rahe ho (cross-site), 
    tab SameSite=None; Secure use karna padega, warna cookie send nahi hogi.
    */

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        refreshToken,
        accessToken,
        message: "User logged in successfully",
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong while user login" });
  }
});

router.post("/refreh-token", async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decodedToken = jwt.verify(
      //jwt
      incomingRefreshToken,
      process.env.Refresh_Token_Secret
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        message: "Access token refreshed successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong while refreshing access token" });
  }
});

router.post("/logout", protect, async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
});

router.get("/profile", protect, async (req, res) => {
  return res.json(req.user);
});

export default router;
