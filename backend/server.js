import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import exitInterviewRoutes from './routes/exitInterviewRoutes.js';
import resignationRoutes from './routes/resignationRoutes.js';

config();

connectDB();

const app = express();

// ----- MIDDLEWARE -----
app.use(cors());

app.use(express.json());

// ----- ROUTES -----
app.use('/api/auth', authRoutes);


// Public auth endpoints
app.use('/api/auth', authRoutes);

// Resignation & Exit Interview (protected/role-based)
app.use('/api', resignationRoutes);
app.use('/api', exitInterviewRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
