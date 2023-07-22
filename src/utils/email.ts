import { sendEmail } from 'src/library/Mailler';

const ResetPasswordText = (token: string) => `Hello,

We received a request to reset your password for your HieuCollection account. If you did not make this request, please ignore this email. Otherwise, please click the link below to set a new password:

${process.env.FRONT_END_URL}/reset_password?code=${token}

This link will expire in 15 minutes.

If you have any questions or need assistance, please contact us at:

${process.env.FRONT_END_URL}/contact

Thank you for choosing HieuCollection for your furniture needs!

Sincerely, The HieuCollection Team`;

export const sendResetPasswordEmail = (email: string, token: string) => {
  return sendEmail(email, 'Reset your password for HieuCollection', ResetPasswordText(token));
};
