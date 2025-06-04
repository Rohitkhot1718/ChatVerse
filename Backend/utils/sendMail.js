import nodemailer from 'nodemailer'

export default async function sendVerificationEmail(to, subject, html) {
    try {
        // Test SMTP connection first
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        // Verify transporter
        await transporter.verify();

        const mailOptions = {
            from: `"ChatVerse" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;

    } catch (error) {
        console.error("❌ Email sending failed:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        throw error;
    }
}