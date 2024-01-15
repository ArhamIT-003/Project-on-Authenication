import User from "../models/userModel.js";
import { decryptPassword, hashPassword } from "../utils/hashpassword.js";
import { generateToken } from "../utils/token.js";

// @desc Register your profile
// route POST/api/user/profile
// access Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
    } else {
      const user = await User.create({
        name,
        email,
        password: await hashPassword(password),
      });
      if (user) {
        generateToken(res, user._id);
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc Login your profile
// route POST/api/user/profile
// access Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await decryptPassword(password, user.password))) {
      generateToken(res, user._id);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        message: "User Found Successfully",
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc Logout from your profile
// route POST/api/user/profile
// access Private
export const LogoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
};

// @desc Update your profile
// route PUT/api/user/profile
// access Private
export const updateUser = async (req, res) => {
  res.status(200).json({ message: "Update User" });
};

// @desc GET your profile
// route GET/api/user/profile
// access Private
export const getUser = async (req, res) => {
  res.status(200).json({ message: "Get User" });
};
