import express from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import generateAccessAndRefreshToken from "../utils/tokens.js";

const router = express.Router();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
});

const registerUserWithRole = async (req, res, role) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => !field?.trim())) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(password)) {
    return res.status(400).json({
      message: "Password must contain at least one special character",
    });
  }

  try {
    const user = new User({ name, email, password, role });
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({ message: "Something went wrong while registering a user" });
    }

    const options = getCookieOptions();
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ user: createdUser, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while registering a user" });
  }
};

router.post("/register", (req, res) => registerUserWithRole(req, res, "customer"));
router.post("/seller/register", (req, res) => registerUserWithRole(req, res, "admin"));

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = getCookieOptions();

    /*
    Localhost / Dev mode → Avoid SameSite=None unless tum HTTPS + Secure use kar rahe ho.
    Production (HTTPS enabled) → Agar tum API aur frontend alag domain pe use kar rahe ho (cross-site), 
    tab SameSite=None; Secure use karna padega, warna cookie send nahi hogi.
    */

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ user: loggedInUser, message: "User logged in successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong while user login" });
  }
});

router.post("/refreh-token", async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.Refresh_Token_Secret);
    const user = await User.findById(decodedToken?._id);

    if (!user) return res.status(401).json({ message: "Invalid refresh token" });
    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    const options = getCookieOptions();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ accessToken, refreshToken: newRefreshToken, message: "Access token refreshed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong while refreshing access token" });
  }
});

router.post("/logout", protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
  const options = getCookieOptions();
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
