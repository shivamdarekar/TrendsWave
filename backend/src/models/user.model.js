import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+\@.+\../, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minLength: 6,
      validate: {
        validator: function (value) {
          return /[!@#$%^&*(),.?":{}|<>]/.test(value);
        },
        message: "Password must contain at least one special character",
      },
    },
    //validate option lets you add custom validation rules.
    //test() is js regex method, it checks whether the regex pattern exists in the given string (value).

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    refreshToken: {},

    googleId: {
      type: String,
      index: true,
      sparse: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

//password hash middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//match user enter  password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  //short live access token
  return jwt.sign(
    {
      //create jwt - only essential fields
      _id: this._id,
      role: this.role,
    },
    process.env.Access_Token_Secret,
    { expiresIn: process.env.Access_Token_Expiry }
  );
};

userSchema.methods.generateRefreshToken = function () {
  //long live token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.Refresh_Token_Secret,
    { expiresIn: process.env.Refresh_Token_Expiry }
  );
};

export const User = mongoose.model("User", userSchema);
