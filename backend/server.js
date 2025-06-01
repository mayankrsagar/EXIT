import cors from 'cors'; // <-- ADD THIS
// backend/server.js
import dotenv from 'dotenv';
import express from 'express';

import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://exit-nu.vercel.app', // Production frontend
  'http://localhost:3000',      // Local frontend (Next.js)
  'http://localhost:5173',      // (if using Vite or other local ports)
  'http://127.0.0.1:5500',      // (optional: for file:// tests)
  'http://localhost:1234',      // (Cypress might use this)
  "https://exit-mayank-sagars-projects.vercel.app/",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // <-- if you're using cookies or headers that need credentials
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Catch‐all 404 for unknown routes
app.use((req, res, next) => {
  return res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Server Error';
  return res.status(status).json({ error: message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
