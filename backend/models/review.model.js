import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rating: {
      type: Number,
      default: 1,
  },
  isFav: {
      type: Boolean,
      default: false,
  },
  reviewText: [
    {
      questionId: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Review = mongoose.model("Review", reviewSchema);
