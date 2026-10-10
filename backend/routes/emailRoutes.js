const express = require("express");
const nodemailer = require("nodemailer");
const Email = require("../models/Email");

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/send", async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject?.trim() || !body?.trim() || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject, body and at least one recipient are required.",
      });
    }

    const cleanRecipients = [...new Set(
      recipients
        .map((email) => String(email).trim().toLowerCase())
        .filter(Boolean)
    )];

    const invalidEmails = cleanRecipients.filter(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email address: ${invalidEmails[0]}`,
      });
    }

    const emailRecord = await Email.create({
      subject: subject.trim(),
      body: body.trim(),
      recipients: cleanRecipients,
      status: "failed",
    });

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: process.env.MAIL_FROM || process.env.SMTP_USER,
        bcc: cleanRecipients,
        subject: subject.trim(),
        text: body.trim(),
      });

      emailRecord.status = "sent";
      emailRecord.error = "";
      await emailRecord.save();

      return res.status(200).json({
        success: true,
        message: `Email sent successfully to ${cleanRecipients.length} recipient(s).`,
        email: emailRecord,
      });
    } catch (mailError) {
      emailRecord.status = "failed";
      emailRecord.error = mailError.message;
      await emailRecord.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Check your SMTP settings.",
      });
    }
  } catch (error) {
    console.error("Send email error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while processing the email.",
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, emails });
  } catch (error) {
    console.error("History error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch email history.",
    });
  }
});

module.exports = router;
