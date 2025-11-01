const nodemailer = require('nodemailer');

// Debug logging for email config (only in development)
if (process.env.NODE_ENV !== 'production') {
    console.log('Email Config Debug:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');
}

// Create transporter with multiple service fallbacks
const createTransporter = () => {
    // Try Gmail first with manual SMTP config
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Fallback to Outlook/Hotmail
    if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
        return nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: process.env.OUTLOOK_USER,
                pass: process.env.OUTLOOK_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Generic SMTP fallback
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Development fallback: Use Ethereal Email (fake SMTP for testing)
    if (process.env.NODE_ENV !== 'production') {
        console.log('No email service configured. Using Ethereal Email for testing...');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'your-test-user@ethereal.email', // Will be overridden by createTestAccount
                pass: 'your-test-pass',
            },
        });
    }

    // If no credentials in production, throw error
    throw new Error('No email service configured. Please set EMAIL_USER/EMAIL_PASS, OUTLOOK_USER/OUTLOOK_PASS, or SMTP_HOST/SMTP_USER/SMTP_PASS in environment variables.');
};

const sendOTP = async (email, otp) => {
    let transporter = createTransporter();

    // In development, if Gmail fails, automatically use Ethereal Email
    if (process.env.NODE_ENV !== 'production') {
        try {
            // Test Gmail connection first
            await transporter.verify();
            console.log('Gmail connection verified successfully');
        } catch (gmailError) {
            console.log('Gmail verification failed:', gmailError.message);
            console.log('Switching to Ethereal Email for testing...');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('Ethereal Test Account:');
            console.log('Email:', testAccount.user);
            console.log('Password:', testAccount.pass);
        }
    }

    const mailOptions = {
        from: `"WanderLand" <${process.env.EMAIL_USER || process.env.OUTLOOK_USER || process.env.SMTP_USER || 'noreply@wandreland.com'}>`,
        to: email,
        subject: 'Your OTP for Email Verification - WanderLand',
        text: `Your OTP for WanderLand account verification is: ${otp}. It expires in 10 minutes.`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #fe424d;">Welcome to WanderLand!</h2>
            <p>Your OTP for email verification is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <h1 style="color: #fe424d; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated message from WanderLand. Please do not reply to this email.</p>
        </div>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);

        // In development with Ethereal, show preview URL
        if (process.env.NODE_ENV !== 'production' && info.messageId) {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = { sendOTP };
