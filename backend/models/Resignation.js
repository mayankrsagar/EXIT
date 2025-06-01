// // models/Resignation.js
// import mongoose from 'mongoose';

// const resignationSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     intendedLastWorkingDay: {
//       type: Date,
//       required: true,
//     },
//     reason: {
//       type: String,
//       maxlength: 1000,
//     },
//     status: {
//       type: String,
//       enum: ['Pending', 'Approved', 'Rejected'],
//       default: 'Pending',
//       required: true,
//     },
//     exitDate: {
//       type: Date,
//       default: null, // populated when HR approves
//     },
//     submittedAt: {
//       type: Date,
//       default: () => Date.now(),
//     },
//     decidedAt: {
//       type: Date,
//       default: null, // populated when HR approves/rejects
//     },
//     // holidayChecked: {
//     //   type: Boolean,
//     //   default: false, 
//     //   // You can set this flag to true after validating via Calendarific
//     // },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Resignation', resignationSchema);

// for crio test

// backend/models/Resignation.js
import mongoose from 'mongoose';

const resignationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    intendedLastWorkingDay: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    exitDate: {
      type: Date,
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Resignation =
  mongoose.models.Resignation ||
  mongoose.model('Resignation', resignationSchema);

export default Resignation;
