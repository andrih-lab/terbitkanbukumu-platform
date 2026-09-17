import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string,
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Verifikasi email TerbitkanBukumu Anda",
    html: `
      <p>Halo ${name},</p>
      <p>Terima kasih telah mendaftar di TerbitkanBukumu. Klik tautan berikut untuk memverifikasi email Anda:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Tautan ini berlaku 24 jam. Jika Anda tidak merasa mendaftar, abaikan saja email ini.</p>
    `,
  });
}
