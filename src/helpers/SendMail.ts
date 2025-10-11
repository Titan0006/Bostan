import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

const userEmail = process.env.GMAIL_USER;
const userPass = process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: userEmail,
        pass: userPass
    }
})

class EmailService {

    constructor() {
        this.sendEmail = this.sendEmail.bind(this);
        this.sendOtpEmail = this.sendOtpEmail.bind(this);
    }


    /**
         * Send an email via Gmail
         * @param to - recipient email
         * @param subject - email subject
         * @param text - plain text content
         * @param html - optional HTML content
         */
    async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
        try {
            const mailOptions = {
                from: userEmail,
                to, subject, text, html
            }

            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent :", info.messageId);
            return true;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Send OTP email
     * @param to - recipient email
     * @param otp - OTP code
     */
    async sendOtpEmail(to: string, otp: string | number): Promise<boolean> {
        const subject = "Your OTP Code";
        const text = `Your Otp for this mail is ${otp}`
        const html = `<p>Your OTP code is: <b>${otp}</b></p>`;
        return this.sendEmail(to, subject, text, html,)
    }
}

export default new EmailService();