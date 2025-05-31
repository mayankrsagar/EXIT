// import bcrypt from 'bcryptjs';
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     email:{type:String, required:true,unique:true},
//     password: { type: String, required: true },
//     role: { type: String, default: 'EMPLOYEE', enum: ['HR', 'EMPLOYEE'] },
//   },
//   { timestamps: true }
// );

// // Pre-save middleware: hash password if it’s new or has been modified
// userSchema.pre('save', async function (next) {
//   // `this` refers to the document being saved
//   if (!this.isModified('password')) {
//     // If password was not changed, skip hashing
//     return next();
//   }

//   try {
//     // Generate a salt (default 10 rounds)
//     const salt = await bcrypt.genSalt(10);
//     // Hash the password field with the generated salt
//     this.password = await bcrypt.hash(this.password, salt);
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

// // Optional: instance method to compare candidate password during login
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// const User = mongoose.models.User || mongoose.model('User', userSchema);
// export default User;


//for crio test

import bcrypt from 'bcryptjs';
// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9]+$/, // alphanumeric only
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['HR', 'EMPLOYEE'],
      default: 'EMPLOYEE',
    },
  },
  { timestamps: true }
);

// Hash password before saving (if modified or new)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
