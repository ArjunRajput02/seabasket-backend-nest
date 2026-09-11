import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
// The MailService class is responsible for sending emails, 
// It uses the nodemailer library to create a transporter
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

//configures the nodemailer transporter using SMTP settings from environment variables.
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

//this method sends a verification email to the specified recipient with the provided OTP.
  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Verify your SeaBasket account',
      text: `Your SeaBasket verification OTP is ${otp}. This OTP expires in 10 minutes.`,
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Your SeaBasket OTP</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f4f7fb;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
          "
        >
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color: #f4f7fb; padding: 40px 20px;"
          >
            <tr>
              <td align="center">

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    max-width: 520px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
                  "
                >

                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 30px 20px;
                        background-color: #0f766e;
                      "
                    >
                      <div
                        style="
                          font-size: 28px;
                          font-weight: bold;
                          color: #ffffff;
                          letter-spacing: 0.5px;
                        "
                      >
                        SeaBasket
                      </div>

                      <div
                        style="
                          margin-top: 8px;
                          font-size: 14px;
                          color: #d1fae5;
                        "
                      >
                        Your trusted shopping experience
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 35px;">

                      <h1
                        style="
                          margin: 0 0 15px;
                          font-size: 24px;
                          line-height: 32px;
                          text-align: center;
                          color: #111827;
                        "
                      >
                        Your One-Time Password
                      </h1>

                      <p
                        style="
                          margin: 0 0 25px;
                          font-size: 15px;
                          line-height: 24px;
                          text-align: center;
                          color: #6b7280;
                        "
                      >
                        Use the OTP below to continue with your
                        SeaBasket account.
                      </p>

                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tr>
                          <td align="center">
                            <div
                              style="
                                display: inline-block;
                                padding: 18px 35px;
                                background-color: #f0fdfa;
                                border: 1px solid #99f6e4;
                                border-radius: 10px;
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                color: #0f766e;
                              "
                            >
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin: 25px 0 0;
                          font-size: 14px;
                          line-height: 22px;
                          text-align: center;
                          color: #6b7280;
                        "
                      >
                        This OTP is valid for
                        <strong style="color: #374151;">
                          10 minutes
                        </strong>.
                      </p>

                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          margin-top: 30px;
                          background-color: #f9fafb;
                          border-radius: 8px;
                        "
                      >
                        <tr>
                          <td style="padding: 16px 18px;">
                            <p
                              style="
                                margin: 0;
                                font-size: 13px;
                                line-height: 20px;
                                color: #6b7280;
                              "
                            >

                              Never share this OTP with anyone.
                              SeaBasket will never ask you for your OTP
                              over phone, email, or chat.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin: 30px 0 0;
                          font-size: 14px;
                          line-height: 22px;
                          text-align: center;
                          color: #9ca3af;
                        "
                      >
                        If you did not request this OTP, you can safely
                        ignore this email.
                      </p>

                    </td>
                  </tr>

                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 25px 20px;
                        background-color: #f9fafb;
                        border-top: 1px solid #e5e7eb;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          font-size: 13px;
                          color: #9ca3af;
                        "
                      >
                        All rights reserved.
                      </p>

                      <p
                        style="
                          margin: 8px 0 0;
                          font-size: 12px;
                          color: #9ca3af;
                        "
                      >
                        This is an automated email. Please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    });

    this.logger.log(`Verification OTP sent to ${to}`);
  }
}