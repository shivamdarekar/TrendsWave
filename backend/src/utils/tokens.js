import express from "express"
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //store refresh token in database
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    //res.status(500).json({message: "Something went wrong while generating Access and Refresh Token",});
    console.error("error", error);
  }
};

export default generateAccessAndRefreshToken;