// models/ExitInterview.js
import mongoose from 'mongoose';

const questionResponseSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const exitInterviewSchema = new mongoose.Schema(
  {
    resignation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resignation',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    responses: {
      type: [questionResponseSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one question/response is required.',
      },
    },
    submittedAt: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { timestamps: true }
);

export default mongoose.model('ExitInterview', exitInterviewSchema);
