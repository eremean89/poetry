import { Resend } from "resend";

export const sendEmail = (to: string, subject: string, html: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: "no-reply.poetry.com",
    to,
    subject,
    html,
  });
};
