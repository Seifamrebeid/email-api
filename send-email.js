import nodemailer from "nodemailer";
import multer from "multer";

// multer config (memory)
const upload = multer({ storage: multer.memoryStorage() });

// helper to run multer in Vercel
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // allow POST only
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    // run multer
    await runMiddleware(req, res, upload.single("image"));

    const { to, subject, text } = req.body;
    const file = req.file;

    if (!to || !subject || !text) {
      return res.status(400).send("Missing fields");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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

    res.status(200).send("Email with image sent!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending email");
  }
}