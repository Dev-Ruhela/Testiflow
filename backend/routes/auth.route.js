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

router.get("/check-auth", verifyToken, checkAuth);
router.get("/getSpaces" , getSpaces);
// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Email verification and password reset routes
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// New route for updating profile (protected by verifyToken middleware)
router.put("/profile", verifyToken, updateProfile);
router.post("/googleAuth", googleAuth);
router.post("/setPass", setPass);
router.post("/createSpace", createSpace); 
router.post("/createReview", createReview); 
router.post("/toggleFavourite" , toggleFavourite);
router.get('/getSpaceByLink/:link', getSpaceByLink);
// delete Profile
router.delete("/deleteUser/:id",deleteUser)
router.put("/deleteTestimonial/spaces/:spaceId/reviews/:reviewId" , deleteTestimonial)
router.put("/editSpace",editSpace)

export default router;
