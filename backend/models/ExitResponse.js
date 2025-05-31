// backend/models/ExitResponse.js
import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    responses: [
      {
        questionText: { type: String, required: true },
        response: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ExitResponse =
  mongoose.models.ExitResponse ||
  mongoose.model('ExitResponse', responseSchema);

export default ExitResponse;
