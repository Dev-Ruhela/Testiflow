import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  updateProfile,
 createReview,
  createSpace,
  googleAuth,
  setPass,
  deleteUser,
  getSpaces,
  getSpaceByLink,
  toggleFavourite,
  editSpace,
  deleteTestimonial
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google", googleAuth);
router.post("/setPass", setPass);
router.get("/getSpaces", getSpaces);
router.get("/getSpaceByLink/:link", getSpaceByLink);

// Protected routes (require valid JWT)
router.get("/check-auth", verifyToken, checkAuth);
router.put("/profile", verifyToken, updateProfile);

// Creation & mutation routes
router.post(
  "/createSpace",
  verifyToken,
  createSpace
);
router.post("/createReview", verifyToken, createReview);
router.post("/toggleFavourite", verifyToken, toggleFavourite);
router.put("/editSpace", verifyToken, editSpace);
router.delete("/deleteUser/:id", verifyToken, deleteUser);
router.put(
  "/deleteTestimonial/spaces/:spaceId/reviews/:reviewId",
  verifyToken,
  deleteTestimonial
);

export default router;
