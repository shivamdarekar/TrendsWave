import express from "express";
import { User } from "../models/user.model.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//get all users(admin only request)
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}); //we returning the password issue
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error while retrieving users.");
  }
});

//Add a new user(admin only)
//access -> private/admin
router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await newUser.save(); //exclude password while returning user
    return res
      .status(201)
      .json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while creating new user" });
  }
});

//Update user info(admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while updating user info" });
  }
});

//delete a user
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while deleting the user" });
  }
});

export default router;
