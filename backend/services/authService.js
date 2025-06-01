// import User from '../models/User.js';

// /**
//  * Create a new user.
//  * - Required fields: username, email, password
//  * - Optional: role (defaults to 'EMPLOYEE')
//  * 
//  * Performs:
//  * 1. Duplicate‐username check
//  * 2. Duplicate‐email check
//  * 3. Creates & saves the user (triggers pre('save') for password‐hashing)
//  * 4. Returns the saved user object (with password removed)
//  */
// export const createUser = async ({ username, email, password, role = 'EMPLOYEE' }) => {
//   // (1) Check for duplicate username
//   const existingUsername = await User.findOne({ username });
//   if (existingUsername) {
//     const err = new Error('Username already taken');
//     err.statusCode = 400;
//     throw err;
//   }

//   // (2) Check for duplicate email
//   const existingEmail = await User.findOne({ email });
//   if (existingEmail) {
//     const err = new Error('Email already registered');
//     err.statusCode = 400;
//     throw err;
//   }

//   // (3) Create & save (pre‐save hook hashes password)
//   const newUserDoc = await User.create({ username, email, password, role });

//   // (4) Remove sensitive fields before returning
//   const userObj = newUserDoc.toObject();
//   delete userObj.password;
//   delete userObj.__v;
//   return userObj;
// };

// /**
//  * Find a user by MongoDB ID.
//  * - Returns a user document (excluding password) or null if not found.
//  */
// export const findById = async (id) => {
//   return await User.findById(id).select('-password');
// };

// /**
//  * Find a user by email (for login).
//  * - Returns a user document (including hashed password) or null if not found.
//  */
// export const findByEmail = async (email) => {
//   return await User.findOne({ email });
// };

// /**
//  * Update a user’s password.
//  * Steps:
//  * 1. Retrieve user by ID
//  * 2. If not found → throw 404
//  * 3. Set user.password = newPlaintextPassword → pre('save') hook will hash
//  * 4. Save, then return user without password field
//  */
// export const updatePassword = async (id, newPlaintextPassword) => {
//   const user = await User.findById(id);
//   if (!user) {
//     const err = new Error('User not found');
//     err.statusCode = 404;
//     throw err;
//   }

//   user.password = newPlaintextPassword;
//   await user.save(); // triggers pre‐save hook

//   const updated = user.toObject();
//   delete updated.password;
//   delete updated.__v;
//   return updated;
// };

// /**
//  * Delete a user by ID.
//  * - Returns the deleted user document (excluding password) or null if not found.
//  */
// export const deleteUser = async (id) => {
//   const user = await User.findById(id);
//   if (!user) return null;

//   await user.remove(); // or User.findByIdAndDelete(id)
//   const deletedObj = user.toObject();
//   delete deletedObj.password;
//   delete deletedObj.__v;
//   return deletedObj;
// };

// for crio test

// backend/services/authService.js
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user.
 * - If caller sends only { username, password }, we generate email = `${username}@example.com`
 * - If caller sends { username, email, password }, we use that email (lowercased).
 */
export const registerUser = async ({ username, email, password }) => {
  // If no email provided, auto‐generate:
  const normalizedEmail = email
    ? email.toLowerCase()
    : `${username.toLowerCase()}@example.com`;

  // Check if user exists by username or email
  const existing = await User.findOne({
    $or: [{ username }, { email: normalizedEmail }],
  });
  if (existing) {
    const err = new Error(
      'User already exists with given username or email'
    );
    err.statusCode = 400;
    throw err;
  }

  // Create new user with default role = 'EMPLOYEE'
  await User.create({
    username,
    email: normalizedEmail,
    password,
    role: 'EMPLOYEE',
  });

  return { message: 'User registered successfully' };
};

/**
 * Login user:
 * - Accepts either { username, password } or { email, password }. 
 * - Returns { token }.
 */
export const loginUser = async ({ username, email, password }) => {
  let user;
  if (username) {
    user = await User.findOne({ username });
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
  } else {
    const err = new Error('Must provide username or email');
    err.statusCode = 400;
    throw err;
  }

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 400;
    throw err;
  }

//undefined
// console.log(process.env.JWT_SECRET)
// this is the right way 
  // console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`)

if (!`${process.env.JWT_SECRET}`) {
  throw new Error("JWT_SECRET is missing. Ensure it's set in your environment variables.");
}


  const payload = {
    id: user._id,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token };
};
