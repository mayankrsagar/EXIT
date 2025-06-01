// // services/resignationService.js

// import nodemailer from 'nodemailer';

// import Resignation from '../models/Resignation.js';
// import User from '../models/User.js';
// import CalendarificClient from '../utils/calendarificClient.js';

// /**
//  * Submit a new resignation request.
//  * - Checks employee exists, validates date, checks weekend/holiday, then creates the record.
//  * - Sends an HR notification email if SMTP is configured.
//  */
// export const submitResignation = async ({ employeeId, intendedLastWorkingDay, reason }) => {
//   // 1. Fetch employee
//   const employee = await User.findById(employeeId);
//   if (!employee) {
//     const err = new Error("Employee not found");
//     err.statusCode = 404;
//     throw err;
//   }

//   // 2. Parse the date
//   const dateObj = new Date(intendedLastWorkingDay);
//   if (isNaN(dateObj.getTime())) {
//     const err = new Error("Invalid date format");
//     err.statusCode = 400;
//     throw err;
//   }

//   // 3. Weekend check
//   const dayOfWeek = dateObj.getUTCDay();
//   if (dayOfWeek === 0 || dayOfWeek === 6) {
//     const err = new Error("Last working day cannot fall on a weekend");
//     err.statusCode = 400;
//     throw err;
//   }

//   // 4. Holiday check (Calendarific)
//   let isHoliday = false;
//   try {
//     isHoliday = await CalendarificClient.isHoliday(dateObj, employee);
//   } catch (calErr) {
//     // If Calendarific returns 401/403 (invalid key), fail
//     const err = new Error(`Unable to check holiday: ${calErr.message}`);
//     err.statusCode = 500;
//     throw err;
//   }
//   if (isHoliday) {
//     const err = new Error("Last working day falls on a public holiday");
//     err.statusCode = 400;
//     throw err;
//   }

//   // 5. Save the resignation record
//   const newResignation = await Resignation.create({
//     employee: employeeId,
//     intendedLastWorkingDay: dateObj,
//     reason,
//     status: "Pending",
//   });

//   // 6. Notify HR via email (only if SMTP creds are configured)
//   if (
//     process.env.SMTP_HOST &&
//     process.env.SMTP_PORT &&
//     process.env.SMTP_USER &&
//     process.env.SMTP_PASS &&
//     process.env.HR_EMAIL
//   ) {
//     try {
//       const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT),
//         secure: process.env.SMTP_SECURE === "true",
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS,
//         },
//       });
//       await transporter.sendMail({
//         from: `"Resignation App" <no-reply@yourdomain.com>`,
//         to: process.env.HR_EMAIL,
//         subject: `New Resignation Submitted by ${employee.username}`,
//         text: `Employee ${employee.username} (ID: ${employee._id}) has submitted a resignation. intendedLastWorkingDay: ${intendedLastWorkingDay}`,
//       });
//     } catch (mailerErr) {
//       console.error("Failed to send HR notification email:", mailerErr);
//       // Swallow email errors—do not block the main flow
//     }
//   } else {
//     console.log("Skipping HR email: SMTP credentials not configured");
//   }

//   return newResignation;
// };

// /**
//  * Get all resignations (for HR).
//  * - Populates the `employee` field so you can see username/email/role in the response.
//  */
// export const getAllResignations = async (filter = {}) => {
//   return await Resignation.find(filter).populate("employee", "username email role");
// };

// /**
//  * Approve or reject a resignation.
//  * - Finds the resignation by ID, applies checks, updates status, and sends email to employee.
//  */
// export const concludeResignation = async ({ resignationId, approved, exitDate }) => {
//   // 1. Find the resignation
//   const resignation = await Resignation.findById(resignationId).populate("employee", "username email");
//   if (!resignation) {
//     const err = new Error("Resignation not found");
//     err.statusCode = 404;
//     throw err;
//   }

//   // 2. Only allow if it’s still pending
//   if (resignation.status !== "Pending") {
//     const err = new Error("Resignation has already been concluded");
//     err.statusCode = 400;
//     throw err;
//   }

//   if (approved) {
//     // 3a. If approving, validate the exit date
//     const exitDateObj = new Date(exitDate);
//     if (isNaN(exitDateObj.getTime())) {
//       const err = new Error("Invalid exit date format");
//       err.statusCode = 400;
//       throw err;
//     }

//     // must be ≥ intendedLastWorkingDay
//     if (exitDateObj < new Date(resignation.intendedLastWorkingDay)) {
//       const err = new Error("Exit date cannot be earlier than intended last working day");
//       err.statusCode = 400;
//       throw err;
//     }

//     // check weekend
//     const day = exitDateObj.getUTCDay();
//     if (day === 0 || day === 6) {
//       const err = new Error("Exit date cannot fall on a weekend");
//       err.statusCode = 400;
//       throw err;
//     }

//     // check holiday
//     const isHoliday2 = await CalendarificClient.isHoliday(exitDateObj, resignation.employee);
//     if (isHoliday2) {
//       const err = new Error("Exit date falls on a public holiday");
//       err.statusCode = 400;
//       throw err;
//     }

//     // 3b. Mark as approved
//     resignation.status = "Approved";
//     resignation.exitDate = exitDateObj;
//     resignation.decidedAt = new Date();
//   } else {
//     // 3c. Reject
//     resignation.status = "Rejected";
//     resignation.decidedAt = new Date();
//   }

//   // 4. Save the updated resignation
//   const updated = await resignation.save();

//   // 5. Notify the employee via email (if SMTP is configured)
//   if (
//     process.env.SMTP_HOST &&
//     process.env.SMTP_PORT &&
//     process.env.SMTP_USER &&
//     process.env.SMTP_PASS &&
//     process.env.HR_EMAIL
//   ) {
//     try {
//       const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT),
//         secure: process.env.SMTP_SECURE === "true",
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS,
//         },
//       });

//       const subject = approved
//         ? "Your resignation has been approved"
//         : "Your resignation has been rejected";
//       const text = approved
//         ? `Hello ${resignation.employee.username},\n\nYour resignation has been approved. Your exit date is ${exitDate}.`
//         : `Hello ${resignation.employee.username},\n\nYour resignation has been rejected by HR.`;

//       await transporter.sendMail({
//         from: `"Resignation App" <no-reply@yourdomain.com>`,
//         to: resignation.employee.email,
//         subject,
//         text,
//       });
//     } catch (mailerErr) {
//       console.error("Failed to send employee notification email:", mailerErr);
//       // Don’t throw—just log
//     }
//   } else {
//     console.log("Skipping employee notification email: SMTP credentials not configured");
//   }

//   return updated;
// };


//for crio test 

// backend/services/resignationService.js
import Resignation from '../models/Resignation.js';
import User from '../models/User.js';
import CalendarificClient from '../utils/calendarificClient.js';

/**
 * Submit a resignation:
 *   - employeeId: current user’s ID (string)
 *   - intendedLastWorkingDay: string date (e.g. "2024-12-26")
 */
export const submitResignation = async ({ employeeId, intendedLastWorkingDay }) => {
  // 1. Ensure employee exists
  const employee = await User.findById(employeeId);
  if (!employee) {
    const err = new Error('Employee not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Parse date
  const dateObj = new Date(intendedLastWorkingDay);
  if (isNaN(dateObj.getTime())) {
    const err = new Error('Invalid date format');
    err.statusCode = 400;
    throw err;
  }

  // 3. Weekend check
  const dayOfWeek = dateObj.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const err = new Error('Last working day cannot fall on a weekend');
    err.statusCode = 400;
    throw err;
  }

  // 4. Holiday check (Calendarific)
  let isHoliday = false;
  try {
    isHoliday = await CalendarificClient.isHoliday(dateObj, employee);
  } catch (calErr) {
    const err = new Error(`Unable to check holiday: ${calErr.message}`);
    err.statusCode = 500;
    throw err;
  }
  if (isHoliday) {
    const err = new Error('Last working day falls on a public holiday');
    err.statusCode = 400;
    throw err;
  }

  // 5. Create and save resignation
  const newResignation = await Resignation.create({
    employee: employeeId,
    intendedLastWorkingDay: dateObj,
    status: 'Pending',
    exitDate: null,
    decidedAt: null,
  });

  return newResignation;
};

/**
 * Get all resignations (for admin)
 */
export const getAllResignations = async () => {
  return await Resignation.find()
    .populate('employee', 'username email role')
    .select('_id employee intendedLastWorkingDay status');
};

/**
 * Approve or reject a resignation
 *   - resignationId: string
 *   - approved: boolean
 *   - intendedLastWorkingDay: string (exit date if approved)
 */
export const concludeResignation = async ({ resignationId, approved, intendedLastWorkingDay }) => {
  const resignation = await Resignation.findById(resignationId);
  if (!resignation) {
    const err = new Error('Resignation not found');
    err.statusCode = 404;
    throw err;
  }

  resignation.status = approved ? 'Approved' : 'Rejected';
  resignation.decidedAt = new Date();
  if (approved) {
    // Parse the exit date string (e.g. "26 Dec 2024")
    const exitDateObj = new Date(intendedLastWorkingDay);
    if (isNaN(exitDateObj.getTime())) {
      const err = new Error('Invalid exit date format');
      err.statusCode = 400;
      throw err;
    }
    resignation.exitDate = exitDateObj;
  }

  await resignation.save();

  return {
    _id: resignation._id,
    employee: resignation.employee,
    intendedLastWorkingDay: resignation.intendedLastWorkingDay,
    status: resignation.status,
    exitDate: resignation.exitDate,
    decidedAt: resignation.decidedAt,
  };
};
