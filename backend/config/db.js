import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connect using the connection string only; remove deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
export default connectDB;