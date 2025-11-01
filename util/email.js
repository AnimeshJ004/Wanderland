const { TransactionalEmailsApi } = require('@getbrevo/brevo');

// Debug logging for email config (only in development)
if (process.env.NODE_ENV !== 'production') {
    console.log('Email Config Debug:');
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Set' : 'NOT SET');
}

// Initialize Brevo API client
const createBrevoClient = () => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY is not set in environment variables.');
    }

    const apiInstance = new TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    return apiInstance;
};

const sendOTP = async (email, otp) => {
    const apiInstance = createBrevoClient();

    const sendSmtpEmail = {
        sender: {
            name: 'WanderLand',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@wandreland.com'
        },
        to: [{
            email: email
        }],
        subject: 'Your OTP for Email Verification - WanderLand',
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
        textContent: `Your OTP for WanderLand account verification is: ${otp}. It expires in 10 minutes.`
    };

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`OTP email sent successfully to ${email} via Brevo`);
        return result;
    } catch (error) {
        console.error('Error sending OTP email via Brevo:', error);
        throw error;
    }
};

module.exports = { sendOTP };
