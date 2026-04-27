const getVerificationEmailTemplate = (verificationUrl) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to Reshell!</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering. Please verify your email address to activate your account and start trading.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also click on the following link:</p>
        <p style="font-size: 14px; word-break: break-all;"><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    `;
};

module.exports = {
    getVerificationEmailTemplate,
};
