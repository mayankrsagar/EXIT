// services/resignationService.js

import nodemailer from 'nodemailer';

import Resignation from '../models/Resignation.js';
import User from '../models/User.js';
import CalendarificClient from '../utils/calendarificClient.js';

/**
 * Submit a new resignation request.
 * - Checks employee exists, validates date, checks weekend/holiday, then creates the record.
 * - Sends an HR notification email if SMTP is configured.
 */
export const submitResignation = async ({ employeeId, intendedLastWorkingDay, reason }) => {
  // 1. Fetch employee
  console.log("✅ Function is executing...");

  const employee = await User.findById(employeeId);
  if (!employee) {
    const err = new Error("Employee not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. Parse the date
  const dateObj = new Date(intendedLastWorkingDay);
  if (isNaN(dateObj.getTime())) {
    const err = new Error("Invalid date format");
    err.statusCode = 400;
    throw err;
  }

  // 3. Weekend check
  const dayOfWeek = dateObj.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const err = new Error("Last working day cannot fall on a weekend");
    err.statusCode = 400;
    throw err;
  }

  // 4. Holiday check (Calendarific)
  let isHoliday = false;
  try {
    isHoliday = await CalendarificClient.isHoliday(dateObj, employee);
  } catch (calErr) {
    // If Calendarific returns 401/403 (invalid key), fail
    const err = new Error(`Unable to check holiday: ${calErr.message}`);
    err.statusCode = 500;
    throw err;
  }
  if (isHoliday) {
    const err = new Error("Last working day falls on a public holiday");
    err.statusCode = 400;
    throw err;
  }

  // 5. Save the resignation record
  const newResignation = await Resignation.create({
    employee: employeeId,
    intendedLastWorkingDay: dateObj,
    reason,
    status: "Pending",
  });

  // 6. Notify HR via email (only if SMTP creds are configured)
 if (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS // ✅ Only SMTP credentials needed
)  {
  // Log to confirm you’re entering this branch
  console.log("🟢 SMTP credentials found. About to create transporter.");

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Sometimes it helps to force TLS settings:
      // tls: {
      //   rejectUnauthorized: false,
      // },
    });
    console.log("🟢 Transporter created:", transporter.options);
  } catch (err) {
    console.error("🔴 Failed to create transporter:", err);
    // you might want to re‐throw or return here, depending on if you want to block the flow
  }

  try {
    console.log(
      `🟢 Sending HR notification to ${process.env.HR_EMAIL} ...`
    );
    const info = await transporter.sendMail({
      from: `"Resignation App" <no-reply@yourdomain.com>`,
      to: process.env.HR_EMAIL,
      subject: `New Resignation Submitted by ${employee.username}`,
      text: `Employee ${employee.username} (ID: ${employee._id}) has submitted a resignation. intendedLastWorkingDay: ${intendedLastWorkingDay}`,
    });
    console.log("✅ HR email sent. Message ID:", info.messageId);
  } catch (mailerErr) {
    console.error("🔴 Failed to send HR notification email:", mailerErr);
    // Still swallow, but at least you see exactly what Nodemailer complained about.
  }
} else {
  console.log("Skipping HR email: SMTP credentials not configured");
}


  return newResignation;
};

/**
 * Get all resignations (for HR).
 * - Populates the `employee` field so you can see username/email/role in the response.
 */
export const getAllResignations = async (filter = {}) => {
  return await Resignation.find(filter).populate("employee", "username email role");
};

/**
 * Approve or reject a resignation.
 * - Finds the resignation by ID, applies checks, updates status, and sends email to employee.
 */
export const concludeResignation = async ({ resignationId, approved, exitDate }) => {
  // 1. Find the resignation
  const resignation = await Resignation.findById(resignationId).populate("employee", "username email");
  if (!resignation) {
    const err = new Error("Resignation not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. Only allow if it’s still pending
  if (resignation.status !== "Pending") {
    const err = new Error("Resignation has already been concluded");
    err.statusCode = 400;
    throw err;
  }

  if (approved) {
    // 3a. If approving, validate the exit date
    const exitDateObj = new Date(exitDate);
    if (isNaN(exitDateObj.getTime())) {
      const err = new Error("Invalid exit date format");
      err.statusCode = 400;
      throw err;
    }

    // must be ≥ intendedLastWorkingDay
    if (exitDateObj < new Date(resignation.intendedLastWorkingDay)) {
      const err = new Error("Exit date cannot be earlier than intended last working day");
      err.statusCode = 400;
      throw err;
    }

    // check weekend
    const day = exitDateObj.getUTCDay();
    if (day === 0 || day === 6) {
      const err = new Error("Exit date cannot fall on a weekend");
      err.statusCode = 400;
      throw err;
    }

    // check holiday
    const isHoliday2 = await CalendarificClient.isHoliday(exitDateObj, resignation.employee);
    if (isHoliday2) {
      const err = new Error("Exit date falls on a public holiday");
      err.statusCode = 400;
      throw err;
    }

    // 3b. Mark as approved
    resignation.status = "Approved";
    resignation.exitDate = exitDateObj;
    resignation.decidedAt = new Date();
  } else {
    // 3c. Reject
    resignation.status = "Rejected";
    resignation.decidedAt = new Date();
  }

  // 4. Save the updated resignation
  const updated = await resignation.save();
 
  // 5. Notify the employee via email (if SMTP is configured)
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS 
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const subject = approved
        ? "Your resignation has been approved"
        : "Your resignation has been rejected";
      const text = approved
        ? `Hello ${resignation.employee.username},\n\nYour resignation has been approved. Your exit date is ${exitDate}.`
        : `Hello ${resignation.employee.username},\n\nYour resignation has been rejected by HR.`;

      await transporter.sendMail({
        from: `"Resignation App" <no-reply@yourdomain.com>`,
        to: resignation.employee.email,
        subject,
        text,
      });
    } catch (mailerErr) {
      console.error("Failed to send employee notification email:", mailerErr);
      // Don’t throw—just log
    }
  } else {
    console.log("Skipping employee notification email: SMTP credentials not configured");
  }

  return updated;
};

