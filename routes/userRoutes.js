import express from "express";
import {
  LogoutUser,
  getUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userAuth.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUser);
router.post("/logout", protect, LogoutUser);
router.put("/update/:id", protect, updateUser);

export default router;
