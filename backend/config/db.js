// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     // Connect using the connection string only; remove deprecated options
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// };
// export default connectDB;

// for crio test

// backend/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // these options are no longer required in newer Mongoose versions
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
