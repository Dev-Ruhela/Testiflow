import bcryptjs from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { Space } from "../models/space.model.js";
import { Review } from "../models/review.model.js";
import { v4 as uuidv4 } from 'uuid';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
	service: 'Gmail', 
	auth: {
		user: process.env.EMAIL_USERNAME, 
		pass: process.env.EMAIL_PASSWORD,  
	},
});

// Function to send verification email
export const sendVerificationEmail = async (email, token) => {
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: 'TestiFlow : Verify your email',
		text: `You tried to login TestiFlow . Please verify your email by entering the following code :  ${token}`
	};
	await transporter.sendMail(mailOptions);
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
    const { code } = req.body; // Extract the authorization code from the request body

    try {
        // Exchange the authorization code for tokens
        const { tokens } = await client.getToken(code);

        // Verify the ID token with the OAuth2 client
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches your client ID
        });

        const payload = ticket.getPayload(); // Get the payload from the verified ID token
        const { email, name, sub: googleId } = payload;

        // Find the user in your database
        let user = await User.findOne({ email });

        if (!user) {
            // If the user doesn't exist, create a new one
            user = await User.create({
                email,
                name,
                googleId,
                isVerified: true, // Set email as verified
            });
        } else {
            // If the user exists, update relevant fields if necessary
            user.googleId = googleId; // Update Google ID if it's changed
            await user.save();
        }

        // Generate token and set cookie (you can keep your existing token generation logic)
        generateTokenAndSetCookie(res, user._id, googleId);

        // Respond with the user data (you can send more details if needed)
        res.status(200).json({ user: { email, name, googleId } });
    } catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(403).json({ message: "Failed to authenticate with Google" });
    }
};




export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			isPassword: true,
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// Send verification email
		await sendVerificationEmail(user.email, verificationToken);

		//JWT token and set in cookie
		generateTokenAndSetCookie(res, user._id);

		res.status(201).json({
			success: true,
			message: "User created successfully. Verification email sent.",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};
export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        // Find the user by verification token and check if the token is not expired
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        // Mark the user as verified and remove the token
        user.isVerified = true;
		user.isPassword = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // Optionally send a welcome email
        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Email Verified',
            text: `Thank you for verifying your email, ${user.name}!
			Regards,
			Team TestiFlow`
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("error in verifyEmail", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
	const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: 'Password Reset Request',
		text: `You are receiving this email because you requested a password reset. Please click the following link to reset your password: ${resetUrl}`
	};

	await transporter.sendMail(mailOptions);
};

// Function to send password reset success email
const sendResetSuccessEmail = async (email) => {
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: 'Password Reset Successful',
		text: `Your password has been successfully reset. You can now log in with your new password.`
	};

	await transporter.sendMail(mailOptions);
};

// setting password
export const setPass = async(req,res) => {
	const {email , password} = req.body;
	try {
		const user = await User.findOne({email});
		if(!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}
		if (password) {
			const hashedPassword = await bcryptjs.hash(password, 10);
			user.password = hashedPassword;
			user.isPassword = true;
		}
		await user.save();
		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user: {
			  ...user._doc,
			  password:undefined
			},
		  });
	}
	catch(error) {
		res.status(400).json({ success: false, message: error.message });
	}
}

// Forgot password controller
export const forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		await user.save();

		// Send password reset email
		await sendPasswordResetEmail(user.email, resetToken);

		res.status(200).json({ success: true, message: "Password reset link sent to your email." });
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

// Reset password controller
export const resetPassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	try {
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// Update password
		const hashedPassword = await bcryptjs.hash(password, 10);
		user.password = hashedPassword;
		user.isPassword = true,
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		// Send password reset success email
		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful." });
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
// Update Profile Controller
export const updateProfile = async (req, res) => {
	const { name, email, password } = req.body;
	try {
	  // Find the user by ID (assuming req.userId comes from authentication middleware)
	  const user = await User.findById(req.userId);
  
	  if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	  }
  
	  if (email && email !== user.email) {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
		  return res.status(400).json({ success: false, message: "Email is already in use" });
		}
		user.email = email;
	  }
  
	  // Update name if provided
	  if (name) {
		user.name = name;
	  }
  
	  // Update password if provided (hash it first)
	  if (password) {
		const hashedPassword = await bcryptjs.hash(password, 10);
		user.password = hashedPassword;
	  }
  
	  // Save the updated user
	  await user.save();

	  // Return the updated user information, excluding password
	  res.status(200).json({
		success: true,
		message: "Profile updated successfully",
		user: {
		  ...user._doc,
		  password: undefined,
		},
	  });
	} catch (error) {
	  console.log("Error in updateProfile", error);
	  res.status(500).json({ success: false, message: "Server error" });
	}
  };
  // Feedback submission controller

  
  //delete profile

  export const deleteUser = async (req, res) => {
	const { id } = req.params;
  
	try {
	  // Find and delete the user by ID
	  const deletedUser = await User.findOneAndDelete({email:id});
  
	  if (!deletedUser) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  res.status(200).json({ message: "User successfully deleted" });
	} catch (error) {
	  res.status(500).json({ message: "Error deleting user", error: error.message });
	}
  };

  export const deleteTestimonial = async (req, res) => {
	const { spaceId, reviewId } = req.params;
	console.log('Params:', req.params); // Log request parameters
    console.log('Body:', req.body); // Log request body if any

    try {
        const space = await Space.findOneAndUpdate(
            { spaceId: spaceId }, // Find the space by ID
            { $pull: { reviews: { _id: reviewId } } }, // Remove the review with the given ID
            { new: true } // Return the updated document
        );
		// const review = await Review.findOneAndDelete({_id: reviewId})

        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully', space });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  }

export const createSpace = async (req, res) => {
  try {
    // Get userId from authenticated user (from token)

    // Validate the request body
    const { userEmail , spaceName, spaceLogo, headerTitle, customMessage, questions} = req.body;
    if (!spaceName || !headerTitle) {
      return res.status(400).json({ message: "Name and Header Title are required" });
    }

	const spaceId = uuidv4();
	const link = `https://testiflow.onrender.com/review/${spaceId}`;
    // Create the space
    const newSpace = new Space({
	userEmail,
      spaceName,
      spaceLogo,
      headerTitle,
      customMessage,
      questions,
	  spaceId,
	  link,
    });

    // Save the space
    const savedSpace = await newSpace.save();

	//review link
	
	
    res.status(201).json({
      message: "Space created successfully",
      link : link
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating space" });
  }
};

export const editSpace = async (req, res) => {
	try {
        const { spaceId, spaceData } = req.body;

        // Validate required fields
        if (!spaceId || !spaceData) {
            return res.status(400).json({ message: 'Email, spaceId, and spaceData are required.' });
        }

        // Find the space by email and spaceId
        const space = await Space.findOneAndUpdate(
            { spaceId: spaceId }, // Match email and spaceId
            { $set: spaceData },               // Update the fields provided in spaceData
            { new: true }                       // Return the updated document
        );

        if (!space) {
            return res.status(404).json({ message: 'Space not found for the provided email and spaceId.' });
        }

        res.status(200).json({ message: 'Space updated successfully.', space });
    } catch (error) {
        console.error('Error updating space:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  };

  export const createReview = async (req, res) => {
	try {
		const { spaceId, reviewText, name, email , rating } = req.body;
	
		// Validate the input
		if (!spaceId || !reviewText || !name || !email) {
		  return res.status(400).json({ message: 'Missing required fields' });
		}
	
		// Ensure reviewText is an array and each item is an object with a questionId and an answer
		if (!Array.isArray(reviewText) || !reviewText.every(item => item.questionId && item.answer)) {
		  return res.status(400).json({ message: 'Invalid reviewText format' });
		}
	
		// Check if the space exists
		const space = await Space.findOne({ spaceId });
		if (!space) {
		  return res.status(404).json({ message: 'Space not found' });
		}
	
		// Create a new review
		const newReview = new Review({
		  reviewText,
		  name,
		  email,
		  rating,
		});
	
		// Save the review to the database
		await newReview.save();
	
		// Spread the existing space data and update only the reviews array
		const updatedSpace = {
		  ...space.toObject(),
		  reviews: [...space.reviews, newReview], // Add the new reviewId to the reviews array
		};
	
		// Save the updated space document
		await Space.findByIdAndUpdate(space._id, updatedSpace, { new: true });
		
			return res.status(201).json({
			  message: 'Review submitted successfully',
			  review: newReview,
			});
		  } catch (error) {
			console.error('Error creating review:', error);
			return res.status(500).json({ message: 'Server error' });
		  }
  };

  export const getSpaces = async(req , res) => {
	const userEmail = req.headers['user-email']; // Retrieve email from headers
	if (!userEmail) {
		return res.status(400).send({ error: "Email is required" });
	}
	try {
		const userSpaces = await Space.find({ userEmail }); // Find spaces based on the email
		res.json(userSpaces);
	} catch (error) {
		res.status(500).send({ error: "Failed to fetch spaces" });
	}
  };

export const getSpaceByLink = async (req, res) => {
  const { link } = req.params; // Retrieve the linkId from the URL parameters
  
  if (!link) {
    return res.status(400).json({ error: "Link ID is required" });
  }

  try {
    // Find the space based on the unique link (e.g., using the UUID)
    const space = await Space.findOne({ spaceId: link });

    // If the space is not found, return a message
    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    // Send the space data in the response
    res.status(200).json(space);
  } catch (error) {
    console.error(error);
    // Send error message if something goes wrong
    res.status(500).json({ error: "Failed to fetch space by link" });
  }
};

export const toggleFavourite = async (req, res) => {
	const { spaceId, reviewId, isFav } = req.body;
  
	try {
	  // Find the space by its ID
	  const space = await Space.findOne({ spaceId });
  
	  if (!space) {
		return res.status(404).json({ message: "Space not found" });
	  }
  
	  // Update the `isFav` property for the specific review
	  const updatedReviews = space.reviews.map((review) =>
		review._id.toString() === reviewId
		  ? { ...review.toObject(), isFav } // Update `isFav` using spread operator
		  : review
	  );
  
	  // Create a new space object using spread operator
	  const updatedSpace = {
		...space.toObject(), // Spread existing space fields
		reviews: updatedReviews, // Overwrite reviews with updated ones
	  };
  
	  // Save the updated space
	  await Space.findByIdAndUpdate(space._id, updatedSpace, { new: true });
  
	  res.status(200).json({ success: true, reviews: updatedReviews });
	} catch (error) {
	  console.error("Error updating favorite status:", error);
	  res.status(500).json({ success: false, message: "Internal server error" });
	}
  };
  
