import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    spaceName: {
      type: String,
      required: true,
    },
    spaceLogo: {
      type: String,
      required: true,
    },
    headerTitle: {
      type: String,
      required: true,
    },
    customMessage: {
      type: String,
      required: true,
    },
    link: { type: String, required: true },
    questions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
      },
    ],
    reviews: [
        {
          name: { type: String, required: true },
          email: { type: String, required: true },
          reviewText: [
            {
              questionId: { type: String, required: true },
              answer: { type: String, required: true }
            }
          ],
          isFav: {type: Boolean},
          rating: {type: Number}
        }
      ],
    createdAt: { type: Date, default: Date.now },
    spaceId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Space = mongoose.model("Space", spaceSchema);
