const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());

// store files in memory (not saved on disk)
const upload = multer({ storage: multer.memoryStorage() });

// route with file upload
app.post("/send-email", upload.single("image"), async (req, res) => {
  const { to, subject, text } = req.body;
  const file = req.file;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: file
        ? [
            {
              filename: file.originalname,
              content: file.buffer,
            },
          ]
        : [],
    });

    res.send("Email with image sent!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error sending email");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
