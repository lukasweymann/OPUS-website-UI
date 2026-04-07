// import smtpTransport from "nodemailer-smtp-transport";

export default function contactFunction(req, res) {
  const nodemailer = require("nodemailer");
  const smtpTransport = require("nodemailer-smtp-transport");

  const contactEmail = nodemailer.createTransport(
    smtpTransport({
      host: process.env.OPUS_EMAIL_SERVER,
      secureConnection: false,
      tls: {
        rejectUnauthorized: false,
      },
      port: 587,
      auth: {
        user: process.env.OPUS_EMAIL_USER,
        pass: process.env.OPUS_EMAIL_PASSWORD,
      },
    })
  );

  contactEmail.verify((error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Ready to Send");
    }
  });

  const name = req.body.name;
  const email = req.body.email;
  const url = req.body.url;
  const message = req.body.message;

  const mail = {
    from: process.env.OPUS_EMAIL_USER,
    to: process.env.OPUS_EMAIL_RECEIVER,
    subject: `OPUS website contribution form from ${email}`,
    html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>URL: ${url}</p><p>Message: ${message}</p>`,
  };

  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "SUCCESS" });
    }
  });
}
